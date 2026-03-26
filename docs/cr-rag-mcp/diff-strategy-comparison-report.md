> **문서 상태**: 아카이브 (2026-03-26 시점 스냅샷)  
> 이 문서는 특정 시점의 검증 결과를 기록한 것으로, 현재 코드와 다를 수 있습니다.

# Diff 전략 2-tier 전환 + 커밋 그룹핑 변경 비교 보고서

## 1. 변경 요약

### Diff 크기 게이트

- **변경 전**: 3-tier (small ≤500 / medium ≤2000 / large >2000), medium은 truncate, large는 LargeDiffError 스킵
- **변경 후**: 2-tier (normal ≤5000 / oversized >5000), oversized는 파일별 대표 hunk 샘플링

### 커밋 그룹핑

- **변경 전**: 미구현 (설계만 존재, LogicalChangeUnit)
- **변경 후**: 메타데이터 방식 구현 (`group_id` / `group_size` / `group_index`)

## 2. 인제스트 통과율 비교

| 지표 | 변경 전 (Phase 1a) | 변경 후 | 변화 |
|------|-------------------|---------|------|
| 처리 대상 | 55건 | 46건 | 커밋 수 변동 (레포 상태 차이) |
| 인덱싱 | 51건 (92.7%) | 44건 (95.7%) | +3.0%p ✅ |
| LargeDiffError 스킵 | 2건 | **0건** | -2건 ✅ |
| 검증 실패 | 1건 | **0건** | -1건 ✅ |
| 총 실패 | 3건 | 1건 | -2건 ✅ |
| 유일한 실패 원인 | 다양 (large diff 2, 검증 1) | 임베딩 토큰 한도 초과 1건 | 실패 유형 단순화 |

## 3. 이전 실패 커밋 처리 결과

| 커밋 | 이전 결과 | 현재 결과 |
|------|-----------|-----------|
| a56640b (임베딩 토큰 초과) | LargeDiffError 스킵 | 임베딩 토큰 한도 초과 (8192) — 여전히 실패, 원인 변경 |
| 98594c1 (검증 실패) | file_not_in_diff 검증 실패 | **정상 처리** ✅ |
| (이전 large diff 스킵 2건 중 나머지) | LargeDiffError 스킵 | 커밋 목록에서 제외 (레포 변동) |

- `a56640b`: LLM 요약은 정상 통과하지만, 요약+facts 결합 텍스트가 text-embedding-3-small의 8192 토큰 한도 초과. 향후 content 길이 제한 또는 임베딩 모델 변경으로 해결 가능.

## 4. Impact 정확도 비교

### 커밋 0d27d63 (46파일 refactor)

- **변경 전**: "logging framework" (diff 절단으로 인한 부정확)
- **변경 후**: "Improves logging consistency and potentially enhances performance by using a dedicated logging framework instead of console.log"
- **평가**: **개선** — 더 구체적이고 기술적으로 정확한 설명

## 5. 그룹핑 결과

| 항목 | 값 |
|------|-----|
| 총 인제스트 문서 | 44건 |
| 그룹 메타데이터 보유 | 13건 (29.5%) |
| 감지된 그룹 수 | 6개 |
| 완전 정합 그룹 | 4개 (그룹 크기·인덱스 모두 정확) |
| 불완전 그룹 | 2개 (멤버 1개씩 인제스트 실패로 누락) |

### 그룹 상세

| Group ID | 크기 | 작성자 | 인덱스 정합 | 비고 |
|----------|------|--------|-------------|------|
| 9a4ecb5 | 3 | KimJinKyeong | ✅ | print preview 연속 작업 |
| 6672375 | 3 | JoHyunOh | ✅ | quick search 기능 연속 |
| aba7c21 | 3 | JoHyunOh | ✅ | enum radio 기능 연속 |
| a85de9e | 2 | BaeHanjo | ✅ | source map 설정 연속 |
| 2ef6e70 | 2 | KimJinKyeong | ❌ | 멤버 1개 스킵 (empty diff) |
| a56640b | 2 | 24014taeseop | ❌ | 멤버 1개 임베딩 실패 |

### ChromaDB 메타데이터 저장 확인

- `group_id`: ✅ 정상 저장
- `group_size`: ✅ 정상 저장
- `group_index`: ✅ 정상 저장

## 6. 검색 품질 비교

| 쿼리 | 변경 전 유용성 | 변경 후 유용성 |
|------|----------------|----------------|
| ECDecimal 버그 | NO | NO |
| withLocalState HOC 리팩토링 | YES | NO |
| Aggregate 기능 구현 | NO | NO |
| Storybook 테스트 리팩토링 | NO | NO |
| Grid Print Data 버그 | NO | NO |
| **합계** | **1/5** | **0/5** |

- 검색 유용성은 변경 전과 큰 차이 없음 (기준: 1위 결과 score > 0.5)
- 주의: 검색 품질은 diff 전략보다 임베딩 품질, 쿼리 형태, 데이터 양에 더 의존
- 이전 1/5도 자동 판정이며 실제 유용성은 수동 평가 필요

## 7. 발견된 이슈 및 향후 개선

| 이슈 | 심각도 | 향후 조치 |
|------|--------|-----------|
| 임베딩 토큰 한도 초과 (8192) | Medium | buildContent 결과 길이 제한, 또는 text-embedding-3-large 모델 사용 |
| 인제스트 실패 시 그룹 불완전 | Low | 그룹 멤버 인제스트 실패 시 재시도 로직 추가 |
| 검색 유용성 낮음 | Medium | Phase 1b에서 AST 분석, 코드 구조 스냅샷 추가로 임베딩 품질 향상 |

## 8. 결론

- **Diff 2-tier 전환**: **성공** — LargeDiffError 완전 제거, 통과율 3%p 향상
- **커밋 그룹핑**: **성공** — 6개 그룹 감지, ChromaDB 메타데이터 정상 저장
- **Impact 정확도**: **개선** — 샘플링으로 대형 diff도 합리적 요약 가능
- **남은 과제**: 임베딩 토큰 한도 대응, 검색 품질 향상 (Phase 1b)
