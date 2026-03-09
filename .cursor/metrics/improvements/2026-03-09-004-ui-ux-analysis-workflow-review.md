# UI/UX 분석 작업 워크플로우·규칙 검토

**일시**: 2026-03-09
**사이클**: 2026-03-09-004 (ecount-dev-tool UI/UX 분석 및 개선점 리스트업)
**태스크 유형**: docs
**분석 대상**: UI/UX 분석 작업의 워크플로우 효율성, 규칙 개선 필요성, 메트릭 수집 적절성

---

## 1. 분석 결과 요약

| 항목 | 결과 | 근거 |
|------|------|------|
| **개선 필요** | **Yes** | 워크플로우·프로세스·규칙 3건 개선 기회 |
| 워크플로우 | 적절 | Planner 단독으로 충분, 출력물 품질 양호 |
| 규칙 | 개선 권장 | UI/UX 분석 전용 체크리스트·참조 부재 |
| 메트릭 | 프로세스 이슈 | 사이클 미종료, 최종 보고서 미저장 |

---

## 2. 워크플로우 효율성 분석

### 2.1 현재 실행 패턴

| 단계 | 실행 | 비고 |
|------|------|------|
| Planner | ✅ 실행 | 전체 패키지 분석, 우선순위별 개선점 작성 |
| Developer | 스킵 | 코드 변경 없음 |
| QA | 스킵 | 검증 대상 없음 |
| Docs | 스킵 | 분석 리포트는 Planner가 작성 |
| Security | 스킵 | 구현 단계에서 검토 예정 |

### 2.2 워크플로우 적절성

**결론: Planner 단독 구성이 적절했음**

- **이유**
  - UI/UX 분석은 “설계·분석” 성격이라 Docs보다 Planner에 더 적합
  - task-classifier의 Docs 예시: README, API 문서, JSDoc, CHANGELOG → 코드 문서화 위주
  - 이번 작업은 컴포넌트 코드/Storybook 기반 분석과 개선안 도출 → Planner 역할에 부합
  - 산출물(`ecount-dev-tool-uiux-improvements.md`)에 Critical/High/Medium/Low, a11y, 에러 처리, 결정사항·이슈 포함 → 요구사항 충족

- **다른 에이전트 조합**
  - QA: axe-core 등 a11y 테스트 실행 가능하나, 분석 위주 작업에서는 Planner의 코드 리뷰로 충분
  - Security: C3(비밀번호 평문)은 구현 단계 Security 검토로 처리하는 것이 타당
  - Docs: JSDoc·README·CHANGELOG 수정 아님 → Docs 호출 불필요

### 2.3 Docs 서브타입 명확화 권장

현재 Docs에는 다음 두 패턴이 섞여 있음:

- **문서 작성**: README, API 문서, CHANGELOG → **Docs 에이전트**
- **분석 리포트**: UI/UX 분석, 개선점 리스트, 요구사항 분석 → **Planner 에이전트**

task-classifier에 “분석 리포트” 유형 시 Planner 담당임을 명시하는 것이 좋음.

---

## 3. 규칙 개선 필요성

### 3.1 UI/UX 분석 전용 규칙·체크리스트

**결론: 도입 권장 (우선순위: Medium)**

- **상황**: `ecount-dev-tool-uiux-analysis-plan.md`에 체크리스트가 있으나, Planner Skill/참조로 공식화되어 있지 않음
- **권장**: `.cursor/skills/planner/references/ui-ux-analysis.md` 추가
- **포함 항목**
  - UI 구조: 마크업, 레이아웃, 시각적 계층
  - 사용자 인터랙션: 클릭/키보드/드래그 플로우
  - **접근성(a11y)**: aria-label, role, tabindex, 포커스 순서, 스크린 리더
  - **에러 피드백 패턴**: alert vs Toast vs 인라인, 실패 시 피드백 유무
  - 시각적 일관성: uikit/CSS 변수 일관성
  - 반응형/팝업 크기: Chrome extension 등 고정 크기 대응

### 3.2 접근성·에러 피드백 규칙화

- **a11y**: 이미 `2026-03-06-002` 등 a11y 관련 작업·레퍼런스 존재. UI/UX 분석 시 “a11y 체크리스트 포함”만 Planner 참조에 명시하면 충분
- **에러 피드백**: Critical C1, C2는 `alert()` 및 피드백 부재. 분석 체크리스트에 “에러 처리 방식(alert/Toast/인라인)” 검토 항목 추가 권장

---

## 4. 메트릭 수집 분석

### 4.1 현황

- main-orchestrator: Docs는 “메트릭 스킵 가능”
- plan-execution-workflow: Docs/Hotfix는 메트릭 수집 “스킵 가능”
- cycle 004는 메트릭 JSON을 생성했으나 종료 처리가 미완료

### 4.2 발견된 프로세스 이슈

| 항목 | 기대 | 실제 | 영향 |
|------|------|------|------|
| completed_at | ISO-8601 | null | 사이클 종료 시점 미기록 |
| success | boolean | null | 성공 여부 미판단 |
| 최종 보고서 | `reports/YYYY-MM-DD-NNN-description.md` | 미저장 | 9단계 미수행 |

- 산출물 `ecount-dev-tool-uiux-improvements.md`는 `.cursor/docs/`에 저장됨
- workflow-checklist 9단계 기준으로는 `.cursor/metrics/reports/`에도 최종 보고서 저장 필요

### 4.3 권장 사항

1. **Docs/분석 전용 작업**
   - 메트릭: 최소 수준 수집 유지 (cycle_id, task_type, 시간, 성공 여부)
   - 사이클 JSON을 생성한 경우에는 반드시 `completed_at`, `success` 기록
2. **최종 보고서**
   - Docs만 수행하는 단순 작업이라도, 사이클 JSON이 있으면 9단계 보고서를 `reports/`에 저장하거나, Docs 작업은 9단계를 “스킵 가능”으로 명시
3. **분석 작업용 메트릭**
   - `findings_count` (Critical/High/Medium/Low 수): 선택적, 추세 분석 시에만 활용

---

## 5. 개선 제안 요약

| 대상 | 내용 | 우선순위 |
|------|------|----------|
| task-classifier.md | Docs 서브타입: “분석 리포트”(UI/UX 분석, 개선점 리스트) → Planner 담당 명시 | Low |
| planner/references | `ui-ux-analysis.md` 신설: a11y·에러 피드백·시각적 일관성 등 체크리스트 | Medium |
| main-orchestrator / workflow-checklist | Docs 작업 시 9단계(최종 보고서) 처리 방식 명확화 | Low |

---

## 6. 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| Planner 단독이 UI/UX 분석에 적절 | 분석·설계 성격, 코드 문서화 아님 | Docs 에이전트 호출(출력물 형태 불일치), QA a11y 실행(분석 단계에서는 과도) |
| UI/UX 분석 체크리스트를 Planner 참조로 공식화 | ecount-dev-tool 분석 계획에서 사용한 체크리스트 검증됨 | 규칙 미추가(일관성 저하), planner.md에 직접 삽입(파일 비대) |
| Docs 작업 9단계는 “조건부 필수”로 권장 | 사이클 JSON 생성 시 완전한 종료 처리가 일관성 확보에 유리 | 모든 Docs에서 9단계 필수(과도), 완전 스킵(추적성 저하) |

---

## 7. 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| cycle 004 completed_at/success null | Docs 작업에서도 사이클 종료 시 이 두 필드 기록 | minor |
| reports/ 에 최종 보고서 미저장 | workflow-checklist 9단계에 Docs 작업 예외 규정 추가 또는 Docs도 보고서 저장 | minor |
| task-classifier Docs에 “분석” 패턴 부재 | “분석·리스트업” 시 Planner 담당 명시 | minor |

---

## 8. 참조

- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-09-004.json`
- 산출물: `.cursor/docs/ecount-dev-tool-uiux-improvements.md`
- 실행 계획: `.cursor/docs/ecount-dev-tool-uiux-analysis-plan.md`
- Skill: `.cursor/skills/system-improvement/SKILL.md`
