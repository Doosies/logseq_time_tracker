import type { CommitDocumentMetadata } from '../types/documents.js';
import type { ServerContext } from '../server/server_context.js';
import { isValidCommitHash } from '../storage/meta_store.js';

const REASON_MAX_LENGTH = 2000;

export async function handleSupplementReason(
    ctx: ServerContext,
    args: Record<string, unknown>,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const commit_hash = typeof args['commit_hash'] === 'string' ? args['commit_hash'] : '';
    const reason = typeof args['reason'] === 'string' ? args['reason'] : '';
    const supplemented_by = typeof args['supplemented_by'] === 'string' ? args['supplemented_by'] : '';

    if (!commit_hash || !reason || !supplemented_by) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            error: 'commit_hash, reason, and supplemented_by are required',
                        },
                        null,
                        2,
                    ),
                },
            ],
        };
    }

    if (!isValidCommitHash(commit_hash)) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        { error: 'commit_hash는 7~40자 16진수여야 합니다' },
                        null,
                        2,
                    ),
                },
            ],
        };
    }

    if (reason.length > REASON_MAX_LENGTH) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        { error: `reason은 최대 ${REASON_MAX_LENGTH}자까지 허용됩니다` },
                        null,
                        2,
                    ),
                },
            ],
        };
    }

    const row = await ctx.vector_store.getFirstByCommitHash(commit_hash);
    if (!row) {
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            error: `No indexed document found for commit_hash=${commit_hash}`,
                        },
                        null,
                        2,
                    ),
                },
            ],
        };
    }

    const supplemented_at = new Date().toISOString();
    const old_doc = row.document ?? '';
    const new_doc = `${old_doc}\n\n[보충 사유] (${supplemented_at}, by ${supplemented_by})\n${reason}`;

    const next_meta: CommitDocumentMetadata = {
        ...row.metadata,
        reason_known: true,
        reason_inferred: false,
        reason_supplemented: true,
        verified_at: supplemented_at,
        confidence_score: Math.min(1, row.metadata.confidence_score + 0.05),
    };

    const embedding = await ctx.embedder.embed(new_doc);
    await ctx.vector_store.upsert(row.id, new_doc, embedding, next_meta);
    await ctx.meta_store.saveCommitDocumentMetadata(next_meta);

    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify(
                    {
                        ok: true,
                        id: row.id,
                        commit_hash,
                        supplemented_at,
                    },
                    null,
                    2,
                ),
            },
        ],
    };
}
