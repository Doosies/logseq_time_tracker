import type { Where } from 'chromadb';

import type { EmbeddingGenerator } from '../processing/embedder.js';
import type { ChromaQueryResult, VectorStore } from '../storage/vector_db.js';

export interface SearchResult extends ChromaQueryResult {
    similarity_score: number;
    time_decay_factor: number;
    final_score: number;
}

export class SearchEngine {
    constructor(
        private vector_store: VectorStore,
        private embedder: EmbeddingGenerator,
        private decay_rate = 0.01,
    ) {}

    async search(query_text: string, limit: number, filters?: Record<string, unknown>): Promise<SearchResult[]> {
        const query_embedding = await this.embedder.embed(query_text);
        const where_clause = filters as Where | undefined;
        const raw_results = await this.vector_store.query(query_embedding, limit * 2, where_clause);

        return raw_results
            .map((r) => this.applyTimeWeight(r))
            .sort((a, b) => b.final_score - a.final_score)
            .slice(0, limit);
    }

    private applyTimeWeight(result: ChromaQueryResult): SearchResult {
        const similarity = 1 - result.distance;
        const days_ago = this.daysSince(result.metadata.committed_at);
        const time_decay = Math.exp(-this.decay_rate * days_ago);
        const final_score = similarity * time_decay;

        return {
            ...result,
            similarity_score: similarity,
            time_decay_factor: time_decay,
            final_score,
        };
    }

    private daysSince(date_str: string): number {
        const diff = Date.now() - new Date(date_str).getTime();
        return diff / (1000 * 60 * 60 * 24);
    }
}
