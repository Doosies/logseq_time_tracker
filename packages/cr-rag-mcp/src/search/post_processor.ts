import type { SearchResult } from './engine.js';
import type { PostProcessedResult, ProcessedSearchResult } from '../types/search.js';

const MIN_SIMILARITY_THRESHOLD = 0.25;
const FILE_OVERLAP_THRESHOLD = 0.8;

export class PostProcessor {
    process(raw_results: SearchResult[]): PostProcessedResult {
        const total_raw = raw_results.length;

        // 1. 중복 제거
        const deduped = this.deduplicate(raw_results);

        // 2. 노이즈 필터 (순수 유사도 임계값 이하 제거; final_score는 시간 감쇠 반영)
        const filtered = deduped.filter((r) => r.similarity_score >= MIN_SIMILARITY_THRESHOLD);

        // 3. final_score 내림차순 (유사도×시간 가중 반영 순)
        const sorted = filtered.sort((a, b) => b.final_score - a.final_score);

        const results: ProcessedSearchResult[] = sorted.map((r) => this.toProcessedSearchResult(r));

        const dates = results.map((item) => item.date).sort();

        return {
            results,
            metadata: {
                total_raw_results: total_raw,
                after_dedup: deduped.length,
                after_filter: filtered.length,
                time_range: {
                    earliest: dates[0] ?? '',
                    latest: dates[dates.length - 1] ?? '',
                },
            },
        };
    }

    private toProcessedSearchResult(r: SearchResult): ProcessedSearchResult {
        const base: ProcessedSearchResult = {
            content: r.document ?? '',
            score: r.final_score,
            similarity_score: r.similarity_score,
            commit_hash: r.metadata.commit_hash,
            date: r.metadata.committed_at,
            file_paths: r.metadata.file_paths,
            reason_known: r.metadata.reason_known,
            reason_inferred: r.metadata.reason_inferred,
            change_type: r.metadata.change_type,
            author: r.metadata.author,
            confidence_score: r.metadata.confidence_score,
            impact: r.metadata.impact,
        };
        const risk = r.metadata.risk_notes;
        return risk !== undefined ? { ...base, risk_notes: risk } : base;
    }

    private deduplicate(results: SearchResult[]): SearchResult[] {
        const seen_hashes = new Set<string>();
        const deduped: SearchResult[] = [];

        for (const result of results) {
            const hash = result.metadata.commit_hash;
            if (seen_hashes.has(hash)) continue;
            seen_hashes.add(hash);

            const overlapping = deduped.findIndex(
                (existing) => this.fileOverlapRatio(existing, result) > FILE_OVERLAP_THRESHOLD,
            );

            if (overlapping >= 0 && deduped[overlapping]!.final_score < result.final_score) {
                deduped[overlapping] = result;
            } else if (overlapping < 0) {
                deduped.push(result);
            }
        }

        return deduped;
    }

    private fileOverlapRatio(a: SearchResult, b: SearchResult): number {
        const files_a = new Set(a.metadata.file_paths);
        const files_b = new Set(b.metadata.file_paths);
        const intersection = [...files_a].filter((f) => files_b.has(f)).length;
        const union = new Set([...files_a, ...files_b]).size;
        return union === 0 ? 0 : intersection / union;
    }
}
