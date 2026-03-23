import type { SearchResult } from '../search/engine.js';
import type { ServerContext } from '../server/server_context.js';

const MAX_QUERY_CHARS = 12_000;

function filterByFilePaths(results: SearchResult[], file_paths: string[] | undefined): SearchResult[] {
    if (!file_paths || file_paths.length === 0) {
        return results;
    }
    return results.filter((r) =>
        file_paths.some((want) =>
            r.metadata.file_paths.some((fp) => fp === want || fp.endsWith(want) || want.endsWith(fp)),
        ),
    );
}

export async function handleSearchReviewContext(
    ctx: ServerContext,
    args: Record<string, unknown>,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const diff_text = typeof args['diff_text'] === 'string' ? args['diff_text'] : '';
    const file_paths = Array.isArray(args['file_paths'])
        ? (args['file_paths'] as unknown[]).filter((x): x is string => typeof x === 'string')
        : undefined;
    const limit = typeof args['limit'] === 'number' && args['limit'] > 0 ? Math.floor(args['limit']) : 10;
    const include_raw_diff = args['include_raw_diff'] === true;

    const count = await ctx.vector_store.count();
    if (count === 0) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            cold_start: true,
                            message:
                                '인덱스된 커밋이 없습니다. ingest_commits(bulk 또는 single)로 먼저 인제스트하세요.',
                            results: [],
                        },
                        null,
                        2,
                    ),
                },
            ],
        };
    }

    const query_text =
        diff_text.length > MAX_QUERY_CHARS
            ? `${diff_text.slice(0, MAX_QUERY_CHARS)}\n\n[diff_text truncated for embedding]`
            : diff_text;

    if (!query_text.trim()) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ error: 'diff_text is empty or missing', results: [] }, null, 2),
                },
            ],
        };
    }

    let raw = await ctx.search_engine.search(query_text, Math.max(limit, 5));
    raw = filterByFilePaths(raw, file_paths);
    const post = ctx.post_processor.process(raw);

    const payload: Record<string, unknown> = {
        results: post.results,
        metadata: post.metadata,
    };
    if (include_raw_diff) {
        payload['diff_text'] = diff_text;
    }

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(payload, null, 2),
            },
        ],
    };
}
