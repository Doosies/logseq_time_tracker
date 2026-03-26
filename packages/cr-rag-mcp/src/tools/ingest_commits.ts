import { stat } from 'node:fs/promises';

import { runIngestPipeline } from '../pipeline/ingest_pipeline.js';
import type { ServerContext } from '../server/server_context.js';
import { isValidCommitHash } from '../storage/meta_store.js';

/**
 * MCP `ingest_commits` 요청을 처리한다. 저장소 경로·모드를 검증한 뒤 인제스트 파이프라인을 실행하고 JSON 텍스트 응답을 반환한다.
 */
export async function handleIngestCommits(
    ctx: ServerContext,
    args: Record<string, unknown>,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const repo_path = typeof args['repo_path'] === 'string' ? args['repo_path'] : '';
    const project_id = typeof args['project_id'] === 'string' ? args['project_id'] : '';
    const mode = args['mode'];
    const since_date = typeof args['since_date'] === 'string' ? args['since_date'] : undefined;
    const commit_hash = typeof args['commit_hash'] === 'string' ? args['commit_hash'] : undefined;

    if (!repo_path || !project_id) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'repo_path and project_id are required' }, null, 2),
                },
            ],
        };
    }

    if (mode !== 'bulk' && mode !== 'incremental' && mode !== 'single') {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'mode must be bulk, incremental, or single' }, null, 2),
                },
            ],
        };
    }

    if (commit_hash !== undefined && !isValidCommitHash(commit_hash)) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'commit_hash는 7~40자 16진수여야 합니다' }, null, 2),
                },
            ],
        };
    }

    try {
        const repo_stat = await stat(repo_path);
        if (!repo_stat.isDirectory()) {
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({ error: 'repo_path must be an existing directory' }, null, 2),
                    },
                ],
            };
        }
    } catch {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'repo_path must be an existing directory' }, null, 2),
                },
            ],
        };
    }

    try {
        const pipeline_options: { since_date?: string; commit_hash?: string } = {};
        if (since_date !== undefined) {
            pipeline_options.since_date = since_date;
        }
        if (commit_hash !== undefined) {
            pipeline_options.commit_hash = commit_hash;
        }

        const result = await runIngestPipeline(
            repo_path,
            project_id,
            mode,
            ctx.vector_store,
            ctx.embedder,
            ctx.meta_store,
            undefined,
            Object.keys(pipeline_options).length > 0 ? pipeline_options : undefined,
        );
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: message }, null, 2),
                },
            ],
        };
    }
}
