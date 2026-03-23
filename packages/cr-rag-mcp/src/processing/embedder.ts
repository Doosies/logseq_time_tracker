import OpenAI from 'openai';

import type { StructuredFacts } from '../types/facts.js';
import type { CommitSummary } from '../types/summary.js';

export const MAX_INLINE_FILES = 5;
export const MAX_DIRS = 5;
export const MAX_SYMBOLS = 10;

function getDirectoryPrefix(file_path: string): string {
    const normalized = file_path.replace(/\\/g, '/');
    const slash_index = normalized.lastIndexOf('/');
    if (slash_index === -1) {
        return '.';
    }
    return normalized.slice(0, slash_index + 1);
}

/** 동일 문자열이 연속으로 나온 순서를 유지한 채 중복 제거 */
function uniquePreserveOrder(items: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of items) {
        if (seen.has(item)) {
            continue;
        }
        seen.add(item);
        result.push(item);
    }
    return result;
}

/**
 * 파일 경로 목록을 임베딩용 문자열로 요약합니다.
 * - 5개 이하: 전체 경로 나열 (`파일:`)
 * - 6개 이상: 디렉터리별 집계 후 상위 5개 + 나머지 요약 (`변경 영역:`)
 */
export function summarizeFilePaths(file_paths: string[]): string {
    const total_files = file_paths.length;
    if (total_files <= MAX_INLINE_FILES) {
        return `파일: ${file_paths.join(', ')}`;
    }

    const dir_to_count = new Map<string, number>();
    for (const path_item of file_paths) {
        const dir = getDirectoryPrefix(path_item);
        dir_to_count.set(dir, (dir_to_count.get(dir) ?? 0) + 1);
    }

    const dir_entries = [...dir_to_count.entries()].sort((a, b) => {
        const count_diff = b[1] - a[1];
        if (count_diff !== 0) {
            return count_diff;
        }
        return a[0].localeCompare(b[0]);
    });

    const total_dirs = dir_entries.length;
    const top_dirs = dir_entries.slice(0, MAX_DIRS);
    const rest_dir_count = Math.max(0, total_dirs - MAX_DIRS);

    const top_segments = top_dirs.map(([dir, count]) => `${dir} (${count})`);
    let region_body = top_segments.join(', ');
    if (rest_dir_count > 0) {
        region_body += ` 외 ${rest_dir_count}개 디렉토리`;
    }
    region_body += ` (총 ${total_files}파일)`;

    return `변경 영역: ${region_body}`;
}

/**
 * 함수/심볼 이름 목록을 임베딩용 문자열로 요약합니다.
 * - 10개 이하: 전체 나열 (`심볼:`)
 * - 11개 이상: 상위 10개 + 나머지 개수 (`주요 심볼:`)
 */
export function summarizeSymbols(function_names: string[]): string | null {
    const unique_names = uniquePreserveOrder(function_names);
    const total = unique_names.length;
    if (total === 0) {
        return null;
    }
    if (total <= MAX_SYMBOLS) {
        return `심볼: ${unique_names.join(', ')}`;
    }
    const head = unique_names.slice(0, MAX_SYMBOLS);
    const rest_count = total - MAX_SYMBOLS;
    return `주요 심볼: ${head.join(', ')} 외 ${rest_count}개`;
}

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

    const file_paths = facts.files.map((f) => f.path);
    parts.push(summarizeFilePaths(file_paths));

    const all_symbols = facts.files.flatMap((f) => f.functions_modified);
    const symbols_line = summarizeSymbols(all_symbols);
    if (symbols_line !== null) {
        parts.push(symbols_line);
    }

    return parts.join('\n');
}
