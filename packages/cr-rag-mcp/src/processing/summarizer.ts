import OpenAI from 'openai';

import type { CrRagConfig } from '../types/config.js';
import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary, DiffSizeGate } from '../types/summary.js';
import { estimateDiffSize } from './diff_gate.js';

const DEFAULT_NORMAL_MAX_LINES = 5000;
const LLM_MODEL = 'gpt-4o-mini';

const CHANGE_TYPES = new Set<CommitSummary['change_type']>([
    'bugfix',
    'feature',
    'refactor',
    'optimization',
    'chore',
    'unknown',
]);

export class LargeDiffError extends Error {
    constructor(
        public commit_hash: string,
        public gate: DiffSizeGate,
    ) {
        super(`Large diff detected: ${gate.total_lines} lines, ~$${gate.estimated_cost_usd.toFixed(4)}`);
        this.name = 'LargeDiffError';
    }
}

export interface LlmSummarizerOptions {
    /** When omitted, uses `OPENAI_API_KEY` (see OpenAI SDK defaults). */
    api_key?: string;
    /** Injected client for tests; if set, `api_key` is ignored. */
    client?: OpenAI;
    /** Defaults to gpt-4o-mini. */
    model?: string;
    config?: CrRagConfig;
}

export class LlmSummarizer {
    private readonly client: OpenAI;
    private readonly model: string;
    private readonly config: CrRagConfig | undefined;

    constructor(options: LlmSummarizerOptions = {}) {
        this.client = options.client ?? new OpenAI(options.api_key ? { apiKey: options.api_key } : undefined);
        this.model = options.model ?? LLM_MODEL;
        this.config = options.config;
    }

    async summarize(
        facts: StructuredFacts,
        diff_text: string,
    ): Promise<{ summary: CommitSummary; gate: DiffSizeGate }> {
        const diff_lines = splitDiffLines(diff_text);
        const gate = estimateDiffSize(diff_lines, this.config);

        const normal_max = this.config?.diff_size_gate?.normal_max_lines ?? DEFAULT_NORMAL_MAX_LINES;
        const effective_diff = gate.tier === 'oversized' ? sampleDiffByFile(diff_text, normal_max) : diff_text;

        const summary = await this.callLlm(facts, effective_diff);
        return { summary, gate };
    }

    private async callLlm(facts: StructuredFacts, diff_text: string): Promise<CommitSummary> {
        const user_payload = {
            structured_facts: facts,
            diff: diff_text,
        };

        const completion = await this.client.chat.completions.create({
            model: this.model,
            temperature: 0.1,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: JSON.stringify(user_payload),
                },
            ],
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw || typeof raw !== 'string') {
            throw new Error('OpenAI chat completion returned empty content');
        }

        return parseCommitSummaryJson(raw);
    }
}

function splitDiffLines(diff_text: string): string[] {
    if (diff_text.length === 0) {
        return [];
    }
    return diff_text.split(/\r?\n/);
}

function splitDiffIntoFileChunks(lines: string[]): string[][] {
    const starts: number[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (lines[i]!.startsWith('diff --git ')) {
            starts.push(i);
        }
    }
    if (starts.length === 0) {
        return lines.length > 0 ? [lines] : [];
    }
    const out: string[][] = [];
    for (let j = 0; j < starts.length; j++) {
        const start = starts[j]!;
        const end = j + 1 < starts.length ? starts[j + 1]! : lines.length;
        out.push(lines.slice(start, end));
    }
    return out;
}

function isChangeLine(line: string): boolean {
    if (line.startsWith('+++') || line.startsWith('---')) {
        return false;
    }
    if (line.startsWith('+')) {
        return true;
    }
    if (line.startsWith('-')) {
        return true;
    }
    return false;
}

const HUNK_CONTEXT_RADIUS = 2;

function sampleHunkBody(body: string[], max_lines: number): string[] {
    if (body.length <= max_lines) {
        return [...body];
    }
    const n = body.length;
    const pick = new Set<number>();
    for (let i = 0; i < n; i++) {
        if (!isChangeLine(body[i]!)) {
            continue;
        }
        for (let d = -HUNK_CONTEXT_RADIUS; d <= HUNK_CONTEXT_RADIUS; d++) {
            const j = i + d;
            if (j >= 0 && j < n) {
                pick.add(j);
            }
        }
    }
    if (pick.size === 0) {
        return body.slice(0, max_lines);
    }
    const ordered = [...pick].sort((a, b) => a - b);
    if (ordered.length > max_lines) {
        return ordered.slice(0, max_lines).map((idx) => body[idx]!);
    }
    const extra: number[] = [];
    for (let i = 0; i < n && ordered.length + extra.length < max_lines; i++) {
        if (!pick.has(i)) {
            extra.push(i);
        }
    }
    return [...ordered, ...extra].slice(0, max_lines).map((idx) => body[idx]!);
}

function splitIntoHunks(lines: string[]): { header: string; body: string[] }[] {
    const hunks: { header: string; body: string[] }[] = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i]!;
        if (!line.startsWith('@@ ')) {
            i += 1;
            continue;
        }
        const header = line;
        i += 1;
        const body: string[] = [];
        while (i < lines.length && !lines[i]!.startsWith('@@ ')) {
            body.push(lines[i]!);
            i += 1;
        }
        hunks.push({ header, body });
    }
    return hunks;
}

function sampleFileChunkLines(chunk: string[], max_lines: number): string {
    if (chunk.length === 0) {
        return '';
    }
    if (chunk.length <= max_lines) {
        return chunk.join('\n');
    }
    let first_at = -1;
    for (let i = 0; i < chunk.length; i++) {
        if (chunk[i]!.startsWith('@@ ')) {
            first_at = i;
            break;
        }
    }
    if (first_at < 0) {
        return chunk.slice(0, max_lines).join('\n');
    }
    const preamble = chunk.slice(0, first_at);
    const from_at = chunk.slice(first_at);
    if (preamble.length >= max_lines) {
        return preamble.slice(0, max_lines).join('\n');
    }
    let budget = max_lines - preamble.length;
    const hunks = splitIntoHunks(from_at);
    const with_meta = hunks.map((h, order) => ({
        order,
        header: h.header,
        body: h.body,
        change_count: h.body.filter(isChangeLine).length,
    }));
    with_meta.sort((a, b) => b.change_count - a.change_count);

    type Selected = { order: number; lines: string[] };
    const selected: Selected[] = [];
    for (const h of with_meta) {
        if (budget <= 0) {
            break;
        }
        const full_cost = 1 + h.body.length;
        if (full_cost <= budget) {
            selected.push({ order: h.order, lines: [h.header, ...h.body] });
            budget -= full_cost;
            continue;
        }
        if (budget === 1) {
            selected.push({ order: h.order, lines: [h.header] });
            budget -= 1;
            continue;
        }
        const body_budget = budget - 1;
        const sampled_body = sampleHunkBody(h.body, body_budget);
        selected.push({ order: h.order, lines: [h.header, ...sampled_body] });
        budget -= 1 + sampled_body.length;
    }
    selected.sort((a, b) => a.order - b.order);
    const hunk_lines = selected.flatMap((s) => s.lines);
    return [...preamble, ...hunk_lines].join('\n');
}

export function sampleDiffByFile(diff_text: string, budget: number): string {
    const lines = splitDiffLines(diff_text);
    const total_original_lines = lines.length;
    const chunks = splitDiffIntoFileChunks(lines);
    const file_count = chunks.length;

    if (file_count === 0) {
        return diff_text;
    }
    if (budget <= 0) {
        return `[diff sampled: ${file_count} files, ${total_original_lines} total lines → ${budget} lines]`;
    }

    const base = Math.floor(budget / file_count);
    const rem = budget % file_count;
    const indices_by_size = chunks.map((ch, i) => ({ i, len: ch.length })).sort((a, b) => b.len - a.len);
    const per_file_budget = new Array(file_count).fill(base);
    for (let k = 0; k < rem; k++) {
        const idx = indices_by_size[k]?.i;
        if (idx !== undefined) {
            per_file_budget[idx] += 1;
        }
    }

    const parts: string[] = [];
    for (let f = 0; f < file_count; f++) {
        parts.push(sampleFileChunkLines(chunks[f]!, per_file_budget[f]!));
    }
    const body = parts.join('\n');
    const footer = `[diff sampled: ${file_count} files, ${total_original_lines} total lines → ${budget} lines]`;
    return `${body}\n${footer}`;
}

const SYSTEM_PROMPT = `You are a commit analyst. Output a single JSON object only (no markdown).

Classification for "why" (reason) — three levels:
1) Known: the commit message clearly states the motivation → set reason_known true, reason_inferred false, put the reason in "reason".
2) Inferred (technical only): the diff/message allows a plausible technical explanation (e.g. null check, API rename) → set reason_inferred true, reason_known false, and include a short technical note in "reason". In "what", you may prefix or embed segments with the tag [추론된내용] only for inferred technical points.
3) Unknown: insufficient evidence → reason_known false, reason_inferred false, reason null.

Rules:
- "what": Describe changes grounded in the diff and structured facts. Be accurate; do not invent file-level details not supported by the input.
- Never guess business/product motivations or ticket intent. If unclear, use level 3.
- "impact" and "risk_notes": technical scope only; mark uncertainty briefly if needed.
- change_type must be one of: bugfix, feature, refactor, optimization, chore, unknown.
- The diff may be sampled (one representative hunk per file). Rely on structured_facts for the complete file list, symbols, and change statistics. Do not guess about files not shown in the diff.

Required JSON keys (exact names, booleans not strings):
what (string), reason_known (boolean), reason_inferred (boolean), reason (string or null),
change_type (string), impact (string), risk_notes (string or null)`;

function parseCommitSummaryJson(raw: string): CommitSummary {
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('LLM response was not valid JSON');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('LLM JSON must be a non-array object');
    }

    const o = parsed as Record<string, unknown>;

    const what = o['what'];
    const reason_known = o['reason_known'];
    const reason_inferred = o['reason_inferred'];
    const reason = o['reason'];
    const change_type = o['change_type'];
    const impact = o['impact'];
    const risk_notes = o['risk_notes'];

    if (typeof what !== 'string') {
        throw new Error('CommitSummary.what must be a string');
    }
    if (typeof reason_known !== 'boolean' || typeof reason_inferred !== 'boolean') {
        throw new Error('CommitSummary reason flags must be booleans');
    }
    if (reason !== null && typeof reason !== 'string') {
        throw new Error('CommitSummary.reason must be string or null');
    }
    if (typeof change_type !== 'string' || !CHANGE_TYPES.has(change_type as CommitSummary['change_type'])) {
        throw new Error('CommitSummary.change_type is invalid');
    }
    if (typeof impact !== 'string') {
        throw new Error('CommitSummary.impact must be a string');
    }
    if (risk_notes !== null && typeof risk_notes !== 'string') {
        throw new Error('CommitSummary.risk_notes must be string or null');
    }

    return {
        what,
        reason_known,
        reason_inferred,
        reason: reason as string | null,
        change_type: change_type as CommitSummary['change_type'],
        impact,
        risk_notes: risk_notes as string | null,
    };
}
