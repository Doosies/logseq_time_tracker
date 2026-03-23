# cr-rag-mcp E2E 검증 결과 보고서

> 프로젝트: `d:\personal`  
> 코딩 컨벤션: [`AGENTS.md`](../../AGENTS.md)  
> 참조: [검증 게이트 결과 보고서](./validation-report.md)

---

## 1. 실행 환경

| 항목 | 값 |
|------|-----|
| 대상 리포 | `D:\ecxsolution\flexion` |
| LLM (요약) | gpt-4o-mini |
| LLM (임베딩) | text-embedding-3-small |
| ChromaDB | 1.5.5 (`localhost:8000`, pyenv venv) |
| Node.js | v24.6.0 |
| 테스트 스크립트 | `packages/cr-rag-mcp/test-e2e-scenarios.mjs` |

---

## 2. E2E 시나리오 결과 (4/4 PASS)

### Scenario 4: Cold Start (빈 컬렉션에서 시작)

| 항목 | 값 |
|------|-----|
| 결과 | **PASS** |
| 컬렉션 | `cr_rag_e2e_test` (새로 생성) |
| 대상 | 2026-03-20 이후 15건 |
| 인덱싱 | 12/15 성공 (80%) |
| 검색 | 5건 결과, 145ms |
| Top result | score=0.517, type=refactor |
| 총 소요 | 81.8s |

### Scenario 1: Regression Detection (회귀 감지 검색)

| 항목 | 값 |
|------|-----|
| 결과 | **PASS** |
| 컬렉션 | `cr_rag_gate_test` (기존 51건) |
| 쿼리 | fix ECDefaultDecimal component value display issue when input loses focus |
| 결과 | 4건, 248ms |
| Top result 1 | Score=0.420, Type=feature, Files: `date_range_condition_ast_converter.ts`, `decimal_condition_ast_converter.ts` |
| Top result 2 | Score=0.474, Type=bugfix, Files: `ECDefaultCode.tsx` |
| Decimal 관련 커밋 탐지 | **true** |
| 기준 | 결과 > 0건 && 응답 < 5s → 충족 |

### Scenario 2: Incremental Ingest (단건 추가 인제스트)

| 항목 | 값 |
|------|-----|
| 결과 | **PASS** |
| 컬렉션 | `cr_rag_gate_test` |
| 대상 커밋 | `7c2595c7c` |
| 인덱싱 | 1건 성공 |
| 소요 | 18.2s (기준 30s 이내 → 충족) |
| 문서 수 | 51 → 51 (이미 존재하는 커밋 upsert) |

### Scenario 3: Reason Supplementation (사유 보강)

| 항목 | 값 |
|------|-----|
| 결과 | **PASS** |
| 대상 커밋 | `21f8cad93894507d15ad4eb4fe5190af83f5649e` |
| 보강 전 | reason_supplemented=false, confidence=0.80 |
| 보강 후 | reason_supplemented=true, confidence=0.85 |
| 소요 | 137ms (기준 10s 이내 → 충족) |
| 보강 사유 | ECDecimal 컴포넌트에서 포커스 변경 시 값이 올바르게 표시되지 않는 버그를 수정. useDecimalInput 훅의 값 포맷팅 로직 개선. |

---

## 3. 성능 메트릭

| 항목 | 측정값 | 기준 | 판정 |
|------|--------|------|------|
| Cold Start 벌크 인제스트 (15건) | 81.6s | - | 참고 |
| Cold Start 검색 | 145ms | < 5s | ✅ |
| 검색 응답 (51건 컬렉션) | 248ms | < 5s | ✅ |
| 단건 인제스트 | 18.2s | < 30s | ✅ |
| 사유 보강 | 137ms | < 10s | ✅ |

---

## 4. 전체 결과 JSON

```json
{
  "scenarios": {
    "cold_start": {
      "passed": true,
      "docs_before": 0,
      "docs_after": 12,
      "ingest_indexed": 12,
      "search_results": 5,
      "total_ms": 81812
    },
    "regression_detection": {
      "passed": true,
      "found_related": true,
      "result_count": 4,
      "response_ms": 248
    },
    "incremental_ingest": {
      "passed": true,
      "indexed": 1,
      "duration_ms": 18169
    },
    "reason_supplement": {
      "passed": true,
      "duration_ms": 137,
      "confidence_before": 0.8,
      "confidence_after": 0.85
    }
  },
  "performance": {
    "cold_start_bulk_ingest": 81624,
    "cold_start_search": 145,
    "cold_start_total": 81812,
    "search_response": 248,
    "single_ingest": 18169,
    "supplement_reason": 137
  }
}
```

---

## 5. 판정

- **E2E 최종 판정: PASS** ✅
- 4개 시나리오 모두 통과 (Cold Start, Regression Detection, Incremental Ingest, Reason Supplementation)
- 모든 성능 메트릭이 기준 내

---

## 6. 개선 제안 (Phase 1b)

- Cold Start 인제스트 속도 개선 (15건에 81s)
- 단건 인제스트 속도 개선 (18.2s는 빠르지만, LLM 호출 최적화 여지)
- 검색 점수 분포 분석 및 임계값 튜닝

---

## 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| Cold Start에서 80% 인덱싱 성공으로 PASS 판정 | Gate 기준(80%+) 충족, 실패 3건은 기존 Gate에서 확인된 large diff/경로 불일치 | 100% 요구 (현실적으로 대형 diff 한계) |
| Incremental Ingest에서 upsert 동작 허용 | 이미 존재하는 커밋을 다시 인덱싱해도 안전하게 동작 | 중복 방지 로직 강화 (현재도 정상 동작) |
| 사유 보강 시 confidence +0.05 상향 | 사유 추가는 문서 품질 향상이므로 신뢰도 상승 합리적 | 고정값 or 비율 기반 (단순함 우선) |

---

## 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| Cold Start 3건 실패 | Gate 검증에서 이미 확인된 대형 diff/경로 불일치 — Phase 1b에서 해결 예정 | Low |
| Incremental Ingest 문서 수 변화 없음 (51→51) | 이미 인덱싱된 커밋을 upsert하므로 정상 동작 | Info |
| confidence 부동소수점: 0.85 → 0.8500000000000001 | 표시용 반올림 필요 (`toFixed(2)`) | Low |

---

*작성 목적: cr-rag-mcp E2E 검증 결과 기록 및 Phase 1b 입력.*
