# 작업 완료 보고서

**작업 일자**: 2026-03-25
**작업 ID**: 2026-03-25-002
**요청 내용**: Phase 2G 테스트 미완료 3개 항목 보완 (UC-FSM-004/006 통합, UC-UI-004~006 컴포넌트, UC-E2E-001/002 Playwright E2E)

---

## 1. 요약

| 항목 | 내용 |
|------|------|
| 작업 유형 | Feature |
| 주요 변경 영역 | `@personal/time-tracker-core` (테스트), `@personal/logseq-time-tracker` (E2E 인프라) |
| 신규 파일 | 6개 |
| 수정 파일 | 7개 |

---

## 2. 배경 및 맥락

| 항목 | 내용 |
|------|------|
| 사용자 요청 배경 | Phase 2G 완료 기준 14개 중 11개 완료, 권장/선택 3개 항목 보완 |
| 현재 문제/이슈 | FSM 통합 테스트 미존재, 컴포넌트 테스트 상태별 검증 부족, E2E 인프라 없음 |
| 제약사항 | TimeEntryForm 컴포넌트 미존재로 UC-UI-007/008은 Phase 3으로 이관 |

---

## 3. 수행한 작업

### 직렬-1: UC-FSM-004/006 통합 테스트

- **담당**: developer 서브에이전트
- **내용**: `fsm_storage.test.ts` 신규 작성. UC-FSM-004 (JobService+HistoryService 자동 기록, 3회 전환 검증), UC-FSM-006 (JobStore 반응형 동기화)
- **결과**: 2개 테스트 통과

### 직렬-2: UC-UI-004~006 컴포넌트 테스트

- **담당**: developer 서브에이전트
- **내용**: `JobList.test.ts` 확장. `make_job`에 status 파라미터 추가, UC-UI-004 (상태별 배지), UC-UI-005 (필터링 전달), UC-UI-006 (클릭 매핑)
- **결과**: 기존 5개 + 신규 2개 = 7개 테스트 통과

### 직렬-3: Playwright E2E 인프라

- **담당**: developer 서브에이전트
- **내용**: `@playwright/test` 설치, `playwright.config.ts`, E2E 전용 Vite 설정, standalone 테스트 하네스 (`initializeApp({ storage_mode: 'memory' })` + logseq stub)
- **결과**: Chromium 브라우저 설치, dev 서버 정상 동작 확인

### 직렬-4: UC-E2E-001/002 테스트

- **담당**: developer 서브에이전트
- **내용**: `timer-workflow.spec.ts` 작성. UC-E2E-001 (타이머 시작→경과→정지→기록 확인), UC-E2E-002 (Job A→B 전환, 자동 일시정지)
- **결과**: 2개 E2E 테스트 통과

### 직렬-5: QA 검증

- **담당**: qa 서브에이전트
- **내용**: ReadLints → format → test → lint → type-check → build → E2E 전체 실행
- **결과**: PASS (1건 이슈 발견 후 수정)

### 직렬-6: 문서 업데이트

- **내용**: `2g-tests.md` 체크박스 3개 `[x]` 업데이트, 테스트 수 갱신

---

## 4. 주요 결정사항

| 단계 | 결정 | 근거 | 검토한 대안 |
|------|------|------|-------------|
| planning | UC-UI-007/008 스킵 | TimeEntryForm 컴포넌트 미존재, Phase 3에서 구현 예정 | 컴포넌트 신규 생성 후 테스트 (범위 초과) |
| planning | E2E는 Playwright + standalone harness | Logseq SDK 없이 테스트 가능, memory mode로 WASM 불필요 | @testing-library 통합 테스트 대체 |
| implementation | `globalThis` 이중 캐스팅으로 logseq stub 할당 | `@logseq/libs` Window.logseq 타입 충돌 방지 | `declare global` Window 재선언 |
| implementation | Vitest에서 e2e 디렉토리 exclude | Playwright spec을 Vitest가 수집하면 러너 충돌 | 별도 vitest.config 파일 생성 |

---

## 5. 발견된 이슈 및 해결

| 단계 | 이슈 | 해결 방법 | 영향도 |
|------|------|-----------|--------|
| QA | Vitest가 Playwright spec 파일을 수집하여 `pnpm test` 실패 | `vite.config.ts`에 `test.exclude: ['**/e2e/**']` 추가 | major → 해소 |
| E2E | `#app` 요소가 Playwright에서 visible로 인식되지 않음 | `attached` 상태 확인 + 타이머 section 가시성 대기 | minor |
| E2E | Debug 모달 테이블 필터링이 동작하지 않음 | `columnheader` + `ancestor::table` XPath로 변경 | minor |

---

## 6. 품질 지표

| 지표 | 결과 |
|------|------|
| Linter 오류 (ReadLints) | 0개 |
| 단위/통합 테스트 | 100% (275/275) |
| E2E 테스트 | 100% (2/2) |
| type-check | PASS |
| lint | PASS |
| build | PASS |

---

## 7. 변경된 파일 목록

### 신규 생성
- `packages/time-tracker-core/src/__tests__/integration/fsm_storage.test.ts`
- `packages/logseq-time-tracker/playwright.config.ts`
- `packages/logseq-time-tracker/e2e/index.html`
- `packages/logseq-time-tracker/e2e/test-app.ts`
- `packages/logseq-time-tracker/e2e/vite.config.ts`
- `packages/logseq-time-tracker/e2e/tests/timer-workflow.spec.ts`

### 수정
- `packages/time-tracker-core/src/__tests__/component/JobList.test.ts` (UC-UI-004~006 테스트 추가)
- `packages/logseq-time-tracker/package.json` (@playwright/test, test:e2e 스크립트)
- `packages/logseq-time-tracker/vite.config.ts` (test.exclude e2e)
- `packages/logseq-time-tracker/tsconfig.json` (e2e 포함)
- `packages/logseq-time-tracker/eslint.config.ts` (e2e/dist 무시)
- `docs/phase-plans/time-tracker/phase-2/2g-tests.md` (체크박스 3개 갱신)
- `pnpm-lock.yaml` (Playwright 의존성)

---

## 7-1. 커밋 내역

| # | 커밋 해시 | 메시지 |
|---|-----------|--------|
| 1 | `63c6d95` | docs(time-tracker): Phase 0~2 설계문서 완료 체크박스 일괄 갱신 |
| 2 | `62f5add` | test(time-tracker): SQLite Repository 단위 테스트 4개 추가 |
| 3 | `8a5da41` | test(time-tracker): UC-FSM-004/006 통합 및 UC-UI-004~006 컴포넌트 테스트 추가 |
| 4 | `1620f2d` | feat(time-tracker): Playwright E2E 인프라 구축 및 UC-E2E-001/002 작성 |
| 5 | `04c596a` | chore(time-tracker): Phase 2G 테스트 완료 기준 갱신 및 사이클 메트릭 기록 |
| 6 | `d88c887` | chore(metrics): 사이클 2026-03-25-002 git-workflow·플랜 실행 보고 반영 |

---

## 8. 시스템 개선

- **분석**: system-improvement 스킬 적용 (메인 에이전트 직접 수행)
- **관찰된 패턴 3가지**:
  1. Vitest-Playwright 테스트 러너 충돌 → QA 체크리스트로 대응 (규칙 변경 불필요)
  2. plan-execution 워크플로우 단계 누락 (6,7단계) → 관찰 상태 유지
  3. 서브에이전트 범위 초과 (git-workflow가 메트릭/보고서까지 작성) → 관찰 상태 유지
- **규칙 변경**: 없음 (3회 이상 재발 시 A/B 테스트 설계 예정)
- **리포트 경로**: `.cursor/metrics/improvements/2026-03-25-002-vitest-playwright-boundary.md`

---

## 9. Phase 2G 최종 상태

| 완료 기준 | 상태 |
|-----------|------|
| SQLite Repository 단위 테스트 9개 | [x] |
| migration_runner.test.ts | [x] |
| job_category_service.test.ts | [x] |
| data_export_service.test.ts | [x] |
| storage_fallback.test.ts | [x] |
| web_locks.test.ts | [x] |
| export_import_roundtrip.test.ts | [x] |
| CategoryService 참조 검사 | [x] |
| **fsm_storage.test.ts (UC-FSM-004/006)** | **[x] 신규** |
| **컴포넌트 테스트 (UC-UI-004~006)** | **[x] 신규** |
| **E2E (UC-E2E-001/002)** | **[x] 신규** |
| pnpm test 전체 통과 | [x] 275개 |
| 커버리지 75.41%+ | [x] |
| type-check/lint 성공 | [x] |

**Phase 2G: 14/14 완료 (UC-UI-007/008은 Phase 3으로 이관)**

---

## 10. 후속 작업

- UC-UI-007/008: Phase 3에서 TimeEntryForm 컴포넌트 구현 시 함께 작성
- `logseq-time-tracker/package.json`의 format 글로브에 `vite.config.ts` 포함 검토

---

## 11. 참고

- 플랜 파일: `phase_2g_테스트_보완_3ff2847f.plan.md`
- 사이클 메트릭: `.cursor/metrics/cycles/2026-03-25-002.json`
- 보고서 저장: `.cursor/metrics/reports/2026-03-25-002-phase2g-test-completion.md`
