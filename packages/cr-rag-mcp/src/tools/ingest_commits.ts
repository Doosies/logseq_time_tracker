import { runIngestPipeline } from '../pipeline/ingest_pipeline.js';
import type { ServerContext } from '../server/server_context.js';

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
