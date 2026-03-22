# P1a-7: 후처리 (기본)

## 목표

벡터 DB 검색 결과를 LLM에 전달하기 전에 중복 제거, 시간순 정렬, 노이즈 필터를 적용하여 검색 결과 품질을 향상한다.

---

## 선행 조건

- 검증 게이트 통과 — 임베딩 검색 유용성 60%+ 확인

---

## 참조 설계 문서

| 문서                  | 섹션                | 참조 내용                                  |
| --------------------- | ------------------- | ------------------------------------------ |
| `02-data-pipeline.md` | §9 후처리 레이어    | 4단계 후처리, 중복 제거 전략, 시간 가중치  |
| `02-data-pipeline.md` | §9-2 중복 제거 전략 | DeduplicationRule 인터페이스               |
| `02-data-pipeline.md` | §9-5 출력 구조      | PostProcessedResult, ProcessedSearchResult |

---

## 생성/수정 파일 목록

| 파일                           | 역할                                                      |
| ------------------------------ | --------------------------------------------------------- |
| `src/search/post_processor.ts` | 후처리 파이프라인 (중복 제거 + 시간순 정렬 + 노이즈 필터) |
| `src/types/search.ts`          | PostProcessedResult, ProcessedSearchResult 타입           |

---

## 구현 상세

### src/types/search.ts

```typescript
export interface ProcessedSearchResult {
    content: string;
    score: number; // 최종 점수 (유사도 * 시간 가중치)
    commit_hash: string;
    date: string;
    file_paths: string[];
    reason_known: boolean;
    reason_inferred: boolean;
    change_type: string;
    author: string;
    confidence_score: number;
    impact: string;
    risk_notes?: string;
}

export interface PostProcessedResult {
    results: ProcessedSearchResult[];
    metadata: {
        total_raw_results: number;
        after_dedup: number;
        after_filter: number;
        time_range: { earliest: string; latest: string };
    };
}
```

### src/search/post_processor.ts

```typescript
import type { SearchResult } from './engine.js';
import type { PostProcessedResult, ProcessedSearchResult } from '../types/search.js';

const MIN_SCORE_THRESHOLD = 0.3;
const FILE_OVERLAP_THRESHOLD = 0.8;

export class PostProcessor {
    process(raw_results: SearchResult[]): PostProcessedResult {
        const total_raw = raw_results.length;

        // 1. 중복 제거
        const deduped = this.deduplicate(raw_results);

        // 2. 노이즈 필터 (임계값 이하 제거)
        const filtered = deduped.filter((r) => r.final_score >= MIN_SCORE_THRESHOLD);

        // 3. 시간순 정렬 (최신 먼저)
        const sorted = filtered.sort(
            (a, b) => new Date(b.metadata.committed_at).getTime() - new Date(a.metadata.committed_at).getTime(),
        );

        const results: ProcessedSearchResult[] = sorted.map((r) => ({
            content: r.document,
            score: r.final_score,
            commit_hash: r.metadata.commit_hash,
            date: r.metadata.committed_at,
            file_paths: r.metadata.file_paths,
            reason_known: r.metadata.reason_known,
            reason_inferred: r.metadata.reason_inferred,
            change_type: r.metadata.change_type,
            author: r.metadata.author,
            confidence_score: r.metadata.confidence_score,
            impact: r.metadata.impact,
            risk_notes: r.metadata.risk_notes,
        }));

        const dates = results.map((r) => r.date).sort();

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

    private deduplicate(results: SearchResult[]): SearchResult[] {
        const seen_hashes = new Set<string>();
        const deduped: SearchResult[] = [];

        for (const result of results) {
            const hash = result.metadata.commit_hash;

            // 동일 커밋 해시 중복 제거
            if (seen_hashes.has(hash)) continue;
            seen_hashes.add(hash);

            // 파일 겹침 80% 이상인 기존 결과가 있으면 점수 높은 것만 유지
            const overlapping = deduped.findIndex(
                (existing) => this.fileOverlapRatio(existing, result) > FILE_OVERLAP_THRESHOLD,
            );

            if (overlapping >= 0 && deduped[overlapping].final_score < result.final_score) {
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
```

---

## 완료 기준

- [ ] 동일 커밋 해시 중복 제거 동작
- [ ] 파일 겹침 80%+ 결과 병합 동작
- [ ] 노이즈 필터 (score < 0.3 제거) 동작
- [ ] 시간순 정렬 (최신 먼저) 동작
- [ ] PostProcessedResult.metadata 통계 정확
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ P1a-8: MCP 서버 + 기본 Tools (`P1a-8-mcp-server.md`)
