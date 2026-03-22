# Phase 1H: 테스트

## 목표

Phase 1 구현물에 대한 단위 테스트 + 통합 테스트를 작성합니다. BDD Given-When-Then 스타일, Vitest + @testing-library/svelte 사용. 커버리지 80% 이상.

---

## 선행 조건

- Phase 1G 완료 — 전체 앱 통합 동작 확인됨

---

## 참조 설계 문서

| 문서                  | 섹션                      | 참조 내용                            |
| --------------------- | ------------------------- | ------------------------------------ |
| `07-test-strategy.md` | §전체                     | 테스트 피라미드, 도구, 커버리지 기준 |
| `08-test-usecases.md` | §1 타이머 유즈케이스      | UC-TIMER-001 ~ UC-TIMER-007          |
| `08-test-usecases.md` | §2 Job 유즈케이스         | UC-JOB-001 ~ UC-JOB-005              |
| `08-test-usecases.md` | §3 카테고리 유즈케이스    | UC-CAT-001 ~ UC-CAT-004              |
| `08-test-usecases.md` | §4 TimeEntry 유즈케이스   | UC-ENTRY-001 ~ UC-ENTRY-003          |
| `08-test-usecases.md` | §11 추가 결함 발견 테스트 | 14개 추가 테스트 케이스              |
| `09-user-flows.md`    | UF-01 ~ UF-06             | Phase 1 유저 플로우                  |

---

## 테스트 파일 목록

모든 파일은 `packages/time-tracker-core/tests/` 하위입니다.

### 단위 테스트 — utils

| 파일                          | 테스트 대상                                         |
| ----------------------------- | --------------------------------------------------- |
| `unit/utils/sanitize.test.ts` | sanitizeText: HTML 제거, trim, 최대 길이, 빈 문자열 |
| `unit/utils/time.test.ts`     | getElapsedMs, formatDuration, formatLocalDateTime   |
| `unit/utils/id.test.ts`       | generateId: UUID 형식, 유일성                       |

### 단위 테스트 — types

| 파일                            | 테스트 대상                             |
| ------------------------------- | --------------------------------------- |
| `unit/types/job_status.test.ts` | isValidTransition 전체 경로 + 거부 경로 |

### 단위 테스트 — errors

| 파일                       | 테스트 대상                                  |
| -------------------------- | -------------------------------------------- |
| `unit/errors/base.test.ts` | 6개 에러 클래스 생성, name, code, cause 체인 |

### 단위 테스트 — 서비스

| 파일                                     | 테스트 대상                                                |
| ---------------------------------------- | ---------------------------------------------------------- |
| `unit/services/history_service.test.ts`  | recordTransition, getJobHistory                            |
| `unit/services/job_service.test.ts`      | createJob, transitionStatus, switchJob, deleteJob, cascade |
| `unit/services/category_service.test.ts` | CRUD, seedDefaults 멱등성, 트리 깊이 10, 순환 거부         |
| `unit/services/timer_service.test.ts`    | start/stop/pause/resume/cancel 전체 시나리오               |

### 단위 테스트 — 스토어

| 파일                              | 테스트 대상                                        |
| --------------------------------- | -------------------------------------------------- |
| `unit/stores/timer_store.test.ts` | startTimer, stopTimer, restore, is_running derived |
| `unit/stores/job_store.test.ts`   | setJobs, selectJob, active_job derived             |
| `unit/stores/toast_store.test.ts` | addToast FIFO, 중복 방지, removeToast              |

### 단위 테스트 — Repository

| 파일                                                | 테스트 대상                      |
| --------------------------------------------------- | -------------------------------- |
| `unit/storage/memory_job_repository.test.ts`        | CRUD, getActiveJob 단일 보장     |
| `unit/storage/memory_category_repository.test.ts`   | CRUD, 이름 유일성                |
| `unit/storage/memory_time_entry_repository.test.ts` | CRUD, 필터링, deleteByJobId      |
| `unit/storage/memory_unit_of_work.test.ts`          | transaction 커밋/롤백, 중첩 조인 |

### 통합 테스트

| 파일                                 | 테스트 대상                                       |
| ------------------------------------ | ------------------------------------------------- |
| `integration/timer_workflow.test.ts` | 타이머 시작→정지 전체 플로우 (서비스+스토어+리포) |
| `integration/job_lifecycle.test.ts`  | Job 생성→전환→삭제 cascade                        |
| `integration/app_init.test.ts`       | initializeApp + seedDefaults + timer 복구         |

### 컴포넌트 테스트

| 파일                               | 테스트 대상                                 |
| ---------------------------------- | ------------------------------------------- |
| `component/TimerDisplay.test.ts`   | 경과 시간 표시, 일시정지 시 멈춤            |
| `component/ReasonModal.test.ts`    | 10자 미만 거부, 키보드 Esc/Enter, 로딩 상태 |
| `component/JobList.test.ts`        | 목록 렌더링, 선택 하이라이트, Empty State   |
| `component/ToastContainer.test.ts` | 토스트 표시/해제, 최대 3개                  |

---

## 핵심 테스트 케이스 매핑

### UC-TIMER-001: 기본 타이머 시작/정지

```
Given: pending 상태 Job "회의록 작성" 존재, 카테고리 "개발" 선택
When: 타이머 시작 → 3초 대기 → 타이머 정지 (사유: "회의 종료")
Then:
  - Job 상태: completed
  - TimeEntry 1개 생성 (duration_seconds >= 3)
  - JobHistory 2개 (pending→in_progress, in_progress→completed)
```

### UC-TIMER-003: 타이머 취소

```
Given: in_progress 상태 Job
When: 타이머 취소 (사유: "잘못 시작")
Then:
  - Job 상태: cancelled
  - 경과 > 0초면 TimeEntry 생성, note: "[cancelled] 잘못 시작"
  - 경과 = 0초면 TimeEntry 미생성
```

### UC-TIMER-005: 작업 전환

```
Given: in_progress Job A, pending Job B
When: Job B 선택 후 타이머 시작 (사유: "A 일단 중지")
Then:
  - Job A: paused, TimeEntry 생성 (구간: started_at ~ now)
  - Job B: in_progress
  - timer_store: active_job = B, accumulated_ms = 0
```

### UC-JOB-004: cascade 삭제

```
Given: Job + TimeEntry 3개 + JobHistory 5개
When: Job 삭제
Then: Job, TimeEntry 3개, JobHistory 5개 모두 삭제
```

### UC-CAT-003: seedDefaults 멱등성

```
Given: seedDefaults 이미 1회 실행
When: seedDefaults 재실행
Then: 카테고리 추가 없음 (개수 동일)
```

### UC-TIMER-006: stop() 0초 정책

```
Given: 방금 시작한 타이머 (경과 < 1초)
When: 즉시 stop
Then: TimeEntry null 반환, Job은 completed 전환
```

### 추가 결함 테스트 (08-test-usecases.md §11 일부)

- switchJob 트랜잭션 원자성 (기존 Job stop + 새 Job start 중 실패 → 모두 롤백)
- MemoryUnitOfWork 중첩 트랜잭션 조인 검증
- CategoryService 순환 참조 거부 (A→B→C→A)
- sanitizeText HTML 태그 제거 확인
- ActiveTimerState 복구 시 참조 무결성 실패 → 정리

---

## 커버리지 기준

| 영역                                   | 목표     |
| -------------------------------------- | -------- |
| types + errors + utils                 | 95%+     |
| 서비스 (job, timer, category, history) | 90%+     |
| 스토어 (timer, job, toast)             | 85%+     |
| Repository (memory)                    | 85%+     |
| 컴포넌트 (Timer, ReasonModal 등)       | 80%+     |
| **전체**                               | **80%+** |

---

## 완료 기준

- [ ] 단위 테스트 파일 전부 작성 (utils, types, errors, services, stores, repository)
- [ ] 통합 테스트 3개 작성 (timer workflow, job lifecycle, app init)
- [ ] 컴포넌트 테스트 4개 작성
- [ ] 전체 테스트 통과 (`pnpm test`)
- [ ] 커버리지 80% 이상
- [ ] `pnpm type-check` 성공
- [ ] `pnpm lint` 성공

---

## 다음 단계

→ Phase 2: 영속화 & Job 완성 (`phase-2/plan.md`)
