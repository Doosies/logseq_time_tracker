import OpenAI from 'openai';

import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary } from '../types/summary.js';

export class EmbeddingGenerator {
    private client: OpenAI;

    constructor(
        api_key: string,
        private readonly model = 'text-embedding-3-small',
    ) {
        this.client = new OpenAI({ apiKey: api_key });
    }

    async embed(text: string): Promise<number[]> {
        const response = await this.client.embeddings.create({
            model: this.model,
            input: text,
        });
        const first = response.data[0];
        if (!first?.embedding) {
            throw new Error('OpenAI embeddings response missing embedding vector');
        }
        return first.embedding;
    }

    async embedBatch(texts: string[]): Promise<number[][]> {
        if (texts.length === 0) {
            return [];
        }
        const response = await this.client.embeddings.create({
            model: this.model,
            input: texts,
        });
        return response.data.map((d) => {
            if (!d.embedding) {
                throw new Error('OpenAI embeddings response missing embedding vector');
            }
            return d.embedding;
        });
    }
}

export function buildContent(facts: StructuredFacts, summary: CommitSummary): string {
    const parts: string[] = [summary.what];

    if (summary.reason && summary.reason_known) {
        parts.push(summary.reason);
    }

    parts.push(`파일: ${facts.files.map((f) => f.path).join(', ')}`);

    const symbols = facts.files.flatMap((f) => f.functions_modified);
    if (symbols.length > 0) {
        parts.push(`심볼: ${symbols.join(', ')}`);
    }

    return parts.join('\n');
}
