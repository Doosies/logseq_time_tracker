# 최종 보고서: Diff 전략 2-tier 전환 + 커밋 그룹핑

- **Cycle ID**: 2026-03-23-004
- **태스크**: Refactor
- **시작**: 2026-03-23T06:00:00Z
- **완료**: 2026-03-23T06:30:00Z

## 변경 사항

### 코드 (7 파일 수정, 1 파일 신규)

| 파일 | 변경 |
|------|------|
| `src/types/summary.ts` | DiffSizeGate tier/strategy 타입: 3-tier → 2-tier |
| `src/types/documents.ts` | group_id/group_size/group_index 선택 필드 추가 |
| `src/types/config.ts` | normal_max_lines만 유지 |
| `src/processing/diff_gate.ts` | DEFAULT_NORMAL_MAX=5000, 2-tier 분기 |
| `src/processing/summarizer.ts` | truncateDiff 제거, sampleDiffByFile 구현, 프롬프트 보강 |
| `src/processing/grouper.ts` | **신규** — detectGroups, GroupInfo |
| `src/pipeline/ingest_pipeline.ts` | LargeDiffError 제거, 그룹핑 연동 |
| `src/storage/vector_db.ts` | group 메타데이터 ChromaDB 저장/파싱 |

### 설계 문서 (4 파일)

| 파일 | 변경 |
|------|------|
| `02-data-pipeline.md` | Diff 게이트 2-tier + 커밋 그룹핑 메타데이터 방식 |
| `07-roadmap.md` | Phase 1a/1b 범위 갱신 |
| `phase-1a/00-overview.md` | 2-tier 보완 사항 기록 |
| `phase-1b/plan.md` | 그룹핑 전략 변경 반영 |

## 품질 지표

| 지표 | 변경 전 | 변경 후 |
|------|------|------|
| 인제스트 통과율 | 92.7% (51/55) | **95.7% (44/46)** |
| LargeDiffError 스킵 | 2건 | **0건** |
| 검증 실패 | 1건 | **0건** |
| 총 실패 | 3건 | **1건** |
| 그룹 감지 | 미구현 | 6그룹 13문서 |
| ChromaDB group 메타 | 없음 | 정상 저장 |
| type-check | pass | pass |
| build | pass | pass |
| lint | pass | pass |

## 발견 이슈

1. **vector_db.ts group 메타 누락** (major) — developer 재호출로 즉시 수정
2. **ChromaDB deleteCollection API 미작동** (minor) — REST API로 대체
3. **pipeline_state 파일 경로 불일치** (minor) — 정정
4. **임베딩 토큰 한도 초과** (medium) — Phase 1b에서 content 길이 제한 추가 예정

## 결론

- Diff 2-tier 전환: **성공** — LargeDiffError 완전 제거
- 커밋 그룹핑: **성공** — 메타데이터 방식 구현 및 ChromaDB 저장 확인
- 남은 과제: 임베딩 토큰 한도 대응 (Phase 1b)
