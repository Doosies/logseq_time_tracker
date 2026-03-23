import type { ServerContext } from '../server/server_context.js';

export async function readProjectOverview(
    ctx: ServerContext,
): Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }> {
    let total_docs = 0;
    try {
        total_docs = await ctx.vector_store.count();
    } catch {
        total_docs = 0;
    }

    const states = await ctx.meta_store.listPipelineStates();
    const last_runs = states
        .map((s) => ({ project_id: s.project_id, last_run_at: s.last_run_at, last_commit: s.last_processed_commit }))
        .sort((a, b) => b.last_run_at.localeCompare(a.last_run_at));

    const cold = total_docs === 0;

    const text = JSON.stringify(
        {
            uri: 'project://overview',
            cold_start: cold,
            message: cold
                ? '아직 인덱스된 커밋이 없습니다. ingest_commits 도구로 저장소를 인제스트한 뒤 다시 확인하세요.'
                : '인덱싱 요약',
            total_documents: total_docs,
            pipeline_snapshots: last_runs,
        },
        null,
        2,
    );

    return {
        contents: [
            {
                uri: 'project://overview',
                mimeType: 'application/json',
                text,
            },
        ],
    };
}
