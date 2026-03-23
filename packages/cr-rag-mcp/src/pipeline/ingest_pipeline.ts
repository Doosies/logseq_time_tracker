import { resolve } from 'node:path';

import { GitCollector } from '../collection/git_cli.js';
import { loadConfig } from '../config/loader.js';
import { buildContent, EmbeddingGenerator } from '../processing/embedder.js';
import { extractStructuredFacts } from '../processing/extractor.js';
import { LargeDiffError, LlmSummarizer } from '../processing/summarizer.js';
import { verifyCommitSummary } from '../processing/verifier.js';
import type { JsonMetaStore } from '../storage/meta_store.js';
import type { VectorStore } from '../storage/vector_db.js';
import type { CrRagConfig } from '../types/config.js';
import type { CommitDocumentMetadata } from '../types/documents.js';
import type { StructuredFacts } from '../types/facts.js';
import type { PipelineState } from '../types/pipeline.js';
import type { CommitSummary } from '../types/summary.js';
import type { VerificationResult } from '../types/verification.js';

export interface IngestResult {
    processed: number;
    indexed: number;
    failed: number;
    skipped: number;
    errors: string[];
    duration_ms: number;
}

/** 벡터·메타와 동일한 규칙의 문서 ID */
export function buildCommitDocId(project_id: string, commit_hash: string): string {
    return `${project_id.replace(/\//g, '_')}_${commit_hash}`;
}

function buildCommitDocumentMetadata(
    project_id: string,
    branch: string,
    facts: StructuredFacts,
    summary: CommitSummary,
    verification: VerificationResult,
): CommitDocumentMetadata {
    const symbols = [...new Set(facts.files.flatMap((f) => f.functions_modified))];
    const symbols_modified = symbols.length > 0 ? symbols : ['(none)'];
    const file_paths = facts.files.map((f) => f.path);
    const file_paths_non_empty = file_paths.length > 0 ? file_paths : ['(none)'];
    const file_roles = facts.files.map((f) => f.file_role);
    const file_roles_non_empty = file_roles.length > 0 ? file_roles : ['(none)'];
    const base: CommitDocumentMetadata = {
        doc_type: 'commit',
        commit_hash: facts.commit_hash,
        commit_short: facts.commit_hash.slice(0, 7),
        project_id,
        branch,
        author: facts.author,
        committed_at: facts.date,
        change_type: summary.change_type,
        files_changed: facts.files.length,
        total_additions: facts.total_additions,
        total_deletions: facts.total_deletions,
        file_paths: file_paths_non_empty,
        symbols_modified,
        file_roles: file_roles_non_empty,
        reason_known: summary.reason_known,
        reason_inferred: summary.reason_inferred,
        reason_supplemented: false,
        confidence_score: verification.confidence_score,
        verified_at: verification.verified_at,
        impact: summary.impact,
    };
    if (facts.conventional_type !== undefined) {
        base.conventional_type = facts.conventional_type;
    }
    if (summary.risk_notes !== null && summary.risk_notes !== undefined) {
        base.risk_notes = summary.risk_notes;
    }
    return base;
}

export async function runIngestPipeline(
    repo_path: string,
    project_id: string,
    mode: 'bulk' | 'incremental' | 'single',
    vector_store: VectorStore,
    embedder: EmbeddingGenerator,
    meta_store: JsonMetaStore,
    config?: CrRagConfig,
    options?: { since_date?: string; commit_hash?: string },
): Promise<IngestResult> {
    const started = Date.now();
    const api_key = process.env['OPENAI_API_KEY'];
    if (!api_key || api_key.trim() === '') {
        throw new Error('OPENAI_API_KEY is required for ingest pipeline');
    }

    const abs_repo = resolve(repo_path);
    const cfg = config ?? (await loadConfig(abs_repo));
    const summarizer = new LlmSummarizer({ api_key, config: cfg });
    const collector = new GitCollector(abs_repo);
    const branch = await collector.getCurrentBranch();

    const prev_state = await meta_store.loadPipelineState(project_id);

    let commits;
    if (mode === 'bulk') {
        commits = await collector.listCommits(undefined, {});
    } else if (mode === 'incremental') {
        if (prev_state?.last_processed_commit) {
            commits = await collector.listCommits(prev_state.last_processed_commit);
        } else if (options?.since_date) {
            commits = await collector.listCommits(undefined, { since_iso_date: options.since_date });
        } else {
            throw new Error('incremental ingest requires existing pipeline state (run bulk first) or since_date');
        }
    } else {
        const hash = options?.commit_hash;
        if (!hash) {
            throw new Error('commit_hash is required for single mode');
        }
        commits = await collector.listCommits(undefined, { single_hash: hash });
    }

    const errors: string[] = [];
    let indexed = 0;
    let failed = 0;
    let skipped = 0;

    if (commits.length === 0) {
        return {
            processed: 0,
            indexed: 0,
            failed: 0,
            skipped: 0,
            errors: [],
            duration_ms: Date.now() - started,
        };
    }

    const chronological = [...commits].reverse();
    const processed = chronological.length;

    const state: PipelineState =
        prev_state ??
        ({
            project_id,
            last_processed_commit: '',
            last_run_at: new Date().toISOString(),
            total_processed: 0,
            total_failed: 0,
            failed_items: [],
        } satisfies PipelineState);

    for (const commit of chronological) {
        try {
            const diff = await collector.getDiff(commit.hash);
            if (diff.files.length === 0 || diff.raw_patch.trim() === '') {
                skipped += 1;
                continue;
            }

            const facts = extractStructuredFacts(commit, diff, cfg);
            let summary: CommitSummary;
            try {
                const out = await summarizer.summarize(facts, diff.raw_patch);
                summary = out.summary;
            } catch (e) {
                if (e instanceof LargeDiffError) {
                    const msg = `Large diff skipped: ${commit.hash}: ${e.message}`;
                    errors.push(msg);
                    failed += 1;
                    state.failed_items.push({
                        type: 'commit',
                        id: commit.hash,
                        error: e.message,
                        failed_at: new Date().toISOString(),
                        retry_count: 0,
                    });
                    state.total_failed += 1;
                    continue;
                }
                throw e;
            }

            const verification = verifyCommitSummary(summary, facts);
            if (!verification.passed) {
                const violation_details = verification.violations
                    .filter((v) => v.severity === 'error')
                    .map((v) => `[${v.type}] ${v.detail}`)
                    .join('; ');
                const msg = `Verification failed: ${commit.hash}: ${violation_details}`;
                errors.push(msg);
                failed += 1;
                state.failed_items.push({
                    type: 'commit',
                    id: commit.hash,
                    error: msg,
                    failed_at: new Date().toISOString(),
                    retry_count: 0,
                });
                state.total_failed += 1;
                continue;
            }

            const meta = buildCommitDocumentMetadata(project_id, branch, facts, summary, verification);
            const content = buildContent(facts, summary);
            const embedding = await embedder.embed(content);
            const doc_id = buildCommitDocId(project_id, commit.hash);

            await vector_store.upsert(doc_id, content, embedding, meta);
            await meta_store.saveCommitDocumentMetadata(meta);

            indexed += 1;
            state.last_processed_commit = commit.hash;
            state.total_processed += 1;
            state.last_run_at = new Date().toISOString();
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            errors.push(`${commit.hash}: ${msg}`);
            failed += 1;
            state.failed_items.push({
                type: 'commit',
                id: commit.hash,
                error: msg,
                failed_at: new Date().toISOString(),
                retry_count: 0,
            });
            state.total_failed += 1;
        }
    }

    await meta_store.savePipelineState(state);

    return {
        processed,
        indexed,
        failed,
        skipped,
        errors,
        duration_ms: Date.now() - started,
    };
}
