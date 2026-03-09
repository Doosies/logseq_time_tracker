# Pre-existing 테스트 실패 처리 기준 부재

**일시**: 2026-03-09
**사이클**: 2026-03-09-003 (사용자 스크립트 run_at 옵션 추가)
**분석 대상**: Pre-existing 테스트 실패 시 품질 게이트 처리 기준 미정의

---

## 1. 발견된 문제

### 발견 컨텍스트

| 항목 | 내용 |
|------|------|
| 태스크 | 사용자 스크립트에 run_at 옵션(document_start, document_idle) 추가 |
| QA 결과 | App.svelte.test.ts 2개 테스트 실패 |
| 판단 | run_at 구현과 무관한 기존 회귀 테스트 이슈로 분류 |
| 품질 게이트 | `test: pass_with_warnings`로 진행 |

### 핵심 문제

1. **`pass_with_warnings` 개념 미정의**: 품질 게이트·QA·main-orchestrator 규칙 어디에도 정의되지 않음
2. **관련성 판단 기준 불명확**: "현재 변경과 무관" 판단 기준·절차가 문서화되어 있지 않음
3. **9단계(최종 보고서) 누락 가능성**: system-improvement 진행 중 사이클이 `completed_at: null`로 미완료 상태에 머무를 수 있음

### 반복 패턴

| 사이클 | 유형 | 내용 |
|-------|------|------|
| 2026-02-27-003 | pre-existing | Storybook type 에러 (Stories 파일) |
| 2026-03-01-001 | pre-existing | ERR_REQUIRE_ESM 테스트 환경 이슈 |
| 2026-03-09-003 | pre-existing | App.svelte.test.ts 2개 실패 (run_at 무관) |

---

## 2. 근본 원인 분석

### 원인 1: 예외 프로세스 미문서화
- **현상**: "모든 테스트 통과 필수" 규칙과 pre-existing 실패 허용 판단이 충돌
- **원인**: qa.md, quality-gate.md에 pre-existing 예외 절차가 없음
- **증거**: qa.md "테스트 실패 시" → "코드 문제/테스트 문제" 2분류만 존재, "변경과 무관한 기존 실패" 분류 없음

### 원인 2: 품질 게이트 이원화
- **현상**: Test 게이트가 pass/fail만 정의, pass_with_warnings(조건부 통과) 미지원
- **원인**: main-orchestrator.mdc QA 품질 게이트에 예외 조건 미기재
- **증거**: quality-gate.md "모든 테스트 통과 (필수)"만 명시

### 원인 3: 9단계 강제 부재
- **현상**: 7단계(system-improvement) 완료 후 9단계(최종 보고서) 누락 가능
- **원인**: "7단계 완료 후 반드시 9단계 수행" 체크포인트 없음
- **증거**: 2026-03-09-003이 completed_at: null, success: false로 미완료 상태

---

## 3. 개선 조치

### 조치 1: qa.md에 "Pre-existing 테스트 실패" 절 추가

**파일**: `.cursor/agents/qa.md`

**추가 내용**:
```markdown
## Pre-existing 테스트 실패 처리

현재 변경(이번 작업)과 **무관한** 기존 테스트 실패가 있을 때:

1. **관련성 판단**:
   - 실패한 테스트가 이번 변경으로 수정/추가한 파일·로직과 직접 관련 있는가?
   - 관련 없음 → pre-existing으로 분류 가능

2. **허용 조건** (모두 충족 시 pass_with_warnings 가능):
   - 실패 테스트가 이번 변경 범위 밖임
   - `issues_encountered`에 상세 기록 (실패 파일, 원인, 별도 처리 필요 여부)
   - run_at 변경 시 → background.test.ts 등 변경 파일 테스트는 통과

3. **보고 필수**:
   - QA 결과에 "2 pre-existing failures (unrelated to [변경 내용])" 명시
   - 메인 에이전트에게 `pass_with_warnings` 사유 전달
   - 사이클 메트릭 `quality_gates.test: "pass_with_warnings"` 기록
```

**효과**: QA가 pre-existing 실패 시 일관된 판단·보고 절차 따름

---

### 조치 2: main-orchestrator.mdc QA 품질 게이트 보강

**파일**: `.cursor/rules/main-orchestrator.mdc`

**추가 위치**: 구현 단계 후 체크리스트, QA 단계 후 체크리스트

**추가 내용**:
```markdown
### Test 게이트: pass / pass_with_warnings / fail

- **pass**: 모든 테스트 통과
- **pass_with_warnings**: 일부 pre-existing 실패만 있는 경우
  - 조건: 실패가 이번 변경과 무관, issues_encountered에 기록됨
  - 이 경우 다음 단계 진행 가능
- **fail**: 이번 변경으로 인한 테스트 실패 → QA에게 수정 요청
```

**효과**: 메인 에이전트가 pass_with_warnings 조건을 명확히 인지

---

### 조치 3: quality-gate.md Test 게이트에 pre-existing 예외 추가

**파일**: `.cursor/skills/orchestrator/references/quality-gate.md`

**추가 내용**:
```markdown
#### Pre-existing 테스트 실패 (예외)

- **조건**: 실패 테스트가 이번 작업 변경 범위와 무관
- **절차**: 
  1. QA가 관련성 판단 → 무관 시 pre-existing 분류
  2. issues_encountered에 실패 파일·원인·해결 방향 기록
  3. quality_gates.test: "pass_with_warnings" 기록
  4. 별도 이슈로 후속 처리 권장
- **거부**: 이번 변경으로 인한 실패는 무조건 fail
```

**효과**: 품질 게이트 참조 시 pre-existing 예외 절차 일관 적용

---

### 조치 4: 9단계(최종 보고서) 강제 체크포인트

**파일**: `.cursor/rules/main-orchestrator.mdc`

**추가 위치**: 워크플로우 준수 강제 (CRITICAL) 단계별 체크포인트 테이블

**추가 행**:
| 단계 | 체크포인트 | 실패 시 조치 |
|------|------------|--------------|
| 9 | **7단계 완료 후에도** 최종 보고서 저장·제출 완료했는가? | **즉시 수행** - reports/ 저장, completed_at/success 기록 |

**자가 점검 질문 추가**:
- Q: "7단계(system-improvement) 완료 후 9단계를 수행했는가?"
- A: NO → **작업 미완료**, reports/ 저장 및 사이클 완료 기록 필수

**효과**: system-improvement 후에도 9단계 누락 방지

---

## 4. 검증 방법

### 단기 검증 (다음 작업)
- [ ] QA가 pre-existing 실패 시 issues_encountered 기록 여부 확인
- [ ] pass_with_warnings 사용 시 3개 조건 충족 여부 확인
- [ ] 7단계 완료 후 9단계(보고서) 수행 여부 확인

### 중기 검증 (1주일)
- [ ] pass_with_warnings 사용 건의 일관성 분석
- [ ] completed_at 미기록 사이클 0건 달성

### 장기 검증 (1개월)
- [ ] pre-existing 실패 → 별도 이슈 생성률 측정
- [ ] 품질 게이트 판단 일관성 향상

---

## 5. 예상 효과

### 단기 효과
- pre-existing 실패 시 판단·처리 일관성 향상
- pass_with_warnings 오남용 방지
- 9단계 누락 방지

### 중기 효과
- QA·메인 에이전트 간 품질 게이트 해석 통일
- 사이클 완료율 개선

### 장기 효과
- pre-existing 이슈 추적·후속 처리 체계화
- 반복 패턴 축적 및 자동 개선 가능

---

## 6. 참고

- 워크플로우: `.cursor/workflows/plan-execution-workflow.md`
- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-09-003.json`
- 품질 게이트: `.cursor/skills/orchestrator/references/quality-gate.md`
- QA 에이전트: `.cursor/agents/qa.md`
- 메인 에이전트 규칙: `.cursor/rules/main-orchestrator.mdc`
- 유사 개선: `.cursor/metrics/improvements/2026-02-27-003-bugfix-pattern-analysis-and-agent-rules.md` (패턴 2: pre-existing Storybook type)
