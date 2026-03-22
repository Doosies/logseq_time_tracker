# 테스트 유즈케이스 명세

**작성일**: 2026-03-15
**버전**: 1.0
**형식**: BDD (Given-When-Then)

---

## 1. 개요

모든 테스트의 선행 명세입니다. **유즈케이스 작성 → 세부 테스트 코드 구현** 순서로 진행합니다.

> **관련 문서 (SSOT)**
>
> - 테스트 전략 (워크플로우/피라미드/커버리지): [07-test-strategy.md](07-test-strategy.md)
> - 서비스 책임: [02-architecture.md §4.3 Services](02-architecture.md)
> - 데이터 모델 (필드/제약): [03-data-model.md](03-data-model.md)
> - FSM 전환 규칙: [04-state-management.md §상태 머신](04-state-management.md)
> - UI/UX 컴포넌트: [06-ui-ux.md](06-ui-ux.md)

### ID 체계

`UC-{영역}-{번호}`

| 영역    | 대상                                  |
| ------- | ------------------------------------- |
| TIMER   | TimerService                          |
| JOB     | JobService                            |
| JCAT    | JobCategoryService                    |
| CAT     | CategoryService                       |
| HIST    | HistoryService                        |
| ENTRY   | TimeEntryService                      |
| DFIELD  | DataFieldService                      |
| TMPL    | TemplateService                       |
| STORE   | StorageAdapter (Memory 등)            |
| MIGRATE | 스키마·Export 마이그레이션            |
| FSM     | 상태 머신 전체 흐름 (통합)            |
| TYPE    | 타입 검증                             |
| UI      | Svelte 컴포넌트                       |
| PLUGIN  | Logseq 플러그인 (logseq-time-tracker) |
| E2E     | End-to-End 시나리오                   |
| EDGE    | 엣지 케이스 (동시성, 경계값, 복구 등) |
| REMIND  | 알림·리마인더                         |

---

## 2. time-tracker-core: 단위 테스트

### 2.1 TimerService

#### UC-TIMER-001: 새 타이머 시작

- **Given**: 활성 작업이 없는 상태 (active_job === null)
- **When**: Job A와 Category를 지정하여 타이머를 시작한다
- **Then**: active_job이 Job A로 설정되고, Job A의 상태가 in_progress로 변경된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-002: 진행 중 작업이 있을 때 새 작업 시작

- **Given**: Job A가 in_progress 상태이다
- **When**: Job B로 타이머를 시작한다 (사용자가 입력한 사유: "작업 전환")
- **Then**: Job A는 paused로 전환되고 paused History에 사용자가 입력한 reason("작업 전환")이 기록되며, Job B가 in_progress로 설정되고, Job B의 in_progress History도 생성된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-003: 타이머 일시정지

- **Given**: Job A가 in_progress 상태이다
- **When**: 사유 "점심시간"으로 일시정지한다
- **Then**: Job A가 paused로 전환되고, active_job은 Job A로 유지되며, is_paused가 true로 설정된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-004: 일시정지된 타이머 재개

- **Given**: Job A가 paused 상태이다
- **When**: 사유 "작업 재개"로 재개한다
- **Then**: Job A가 in_progress로 전환되고, active_job이 Job A로 설정된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-005: 타이머 정지 (완료)

- **Given**: Job A가 in_progress 상태이며 타이머가 동작 중이다
- **When**: 사유 "작업 완료"로 정지한다
- **Then**: Job A가 completed로 전환되고, TimeEntry가 생성되며 (started_at, ended_at, duration_seconds 포함), active_job이 null이 된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-006: reason 없이 상태 전환 시도

- **Given**: Job A가 in_progress 상태이다
- **When**: reason 없이 (빈 문자열 또는 undefined) 일시정지를 시도한다
- **Then**: 에러가 발생하고 상태가 변경되지 않는다 (reason은 최소 1글자 이상 필수)
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-007: 활성 작업 없이 pause 호출

- **Given**: active_job이 null이다
- **When**: pause를 호출한다
- **Then**: 에러가 발생한다 (일시정지할 작업 없음)
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-008: 비정상 종료 후 타이머 복구

- **Given**: ActiveTimerState가 Storage에 저장되어 있다 (job_id: A, is_paused: false, accumulated_ms: 60000)
- **When**: 앱이 재시작되고 초기화된다
- **Then**: TimerStore에 Job A가 active로 복원되고, 경과 시간이 60초 + (현재 - started_at) 이상이다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TIMER-010: 30초 주기 ActiveTimerState 백업

- **Given**: Job A로 타이머가 실행 중이다
- **When**: 30초가 경과한다 (vi.useFakeTimers + vi.advanceTimersByTimeAsync 사용)
- **Then**: ISettingsRepository의 active_timer 값이 갱신되고, accumulated_ms가 0보다 큰 값이다
- **Phase**: 1
- **테스트 레벨**: 단위

```typescript
// 테스트 코드 예시
vi.useFakeTimers();
await timer_service.start(job, category, 'test');
await vi.advanceTimersByTimeAsync(30_000);
const state = await uow.settingsRepo.getSetting<ActiveTimerState>('active_timer');
expect(state?.accumulated_ms).toBeGreaterThan(0);
vi.useRealTimers();
```

---

#### UC-TIMER-009: 일시정지 후 경과시간 표시

- **Given**: Job A를 시작하여 10초 경과 후 일시정지한다
- **When**: 일시정지 상태에서 5초를 기다린다
- **Then**: elapsed_seconds가 10초에서 변하지 않는다 (일시정지 중 시간 증가 없음)
- **Phase**: 1
- **테스트 레벨**: 단위

---

### 2.2 JobService

#### UC-JOB-001: Job 생성

- **Given**: 유효한 Job 정보 (title 필수)
- **When**: Job을 생성한다
- **Then**: id, created_at, updated_at이 자동 설정되고, 초기 상태가 pending인 JobStatus가 생성된다
- **Phase**: 1
- **테스트 레벨**: 단위

> **Phase 1 포함 근거**: TimerService.start(job)은 기존 Job을 인자로 받으므로, Phase 1 프로토타입이 동작하려면 최소한의 Job 생성 기능이 필수입니다. Phase 2에서 Job CRUD 전체(수정, 삭제, 상태 전환 등)를 완성합니다.

#### UC-JOB-002: Job 조회

- **Given**: 3개의 Job이 저장되어 있다
- **When**: 전체 Job 목록을 조회한다
- **Then**: 3개의 Job이 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-JOB-003: Job 수정

- **Given**: title이 "기존 작업"인 Job이 존재한다
- **When**: title을 "수정된 작업"으로 변경한다
- **Then**: title이 갱신되고 updated_at이 현재 시각으로 변경된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-004: 잘못된 상태 전환 거부

- **Given**: Job이 completed 상태이다
- **When**: in_progress로 전환을 시도한다
- **Then**: 에러가 발생한다 (FSM 규칙 위반: completed에서 in_progress로 직접 전환 불가, pending 경유 필수)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-005: Job 삭제

- **Given**: Job이 pending 상태이며, 관련 TimeEntry/JobHistory/JobCategory/ExternalRef 레코드가 존재한다
- **When**: Job을 삭제한다
- **Then**: Job과 관련 TimeEntry, JobHistory, JobCategory, ExternalRef가 cascade 삭제된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-006: completed 상태 Job 재오픈

- **Given**: Job이 completed 상태이다
- **When**: 사유 "추가 작업 발생"으로 재오픈한다
- **Then**: Job이 pending으로 전환되고, JobHistory에 completed → pending 전환 기록이 생성된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-007: cancelled 상태 Job 재오픈

- **Given**: Job이 cancelled 상태이다
- **When**: 사유 "취소 철회"로 재오픈한다
- **Then**: Job이 pending으로 전환되고, JobHistory에 cancelled → pending 전환 기록이 생성된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-008: 삭제 불가 상태에서 삭제 시도

- **Given**: Job이 in_progress 상태이다
- **When**: Job을 삭제하려 시도한다
- **Then**: 에러가 발생한다 (pending 또는 cancelled 상태에서만 삭제 가능)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-009: pending 상태에서 직접 취소

- **Given**: Job A가 pending 상태이다
- **When**: 취소(cancelled)로 전환한다 (사유: "불필요한 작업")
- **Then**: Job A의 status가 cancelled로 변경되고, JobHistory에 전환 이력이 기록된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JOB-010: cancelled 상태 Job 삭제

- **Given**: Job이 cancelled 상태이며, 관련 TimeEntry/JobHistory/JobCategory/ExternalRef 레코드가 존재한다
- **When**: Job을 삭제한다
- **Then**: Job과 관련 TimeEntry, JobHistory, JobCategory, ExternalRef가 cascade 삭제된다
- **Phase**: 2
- **테스트 레벨**: 단위

---

### 2.3 HistoryService

#### UC-HIST-001: 상태 전환 시 History 자동 생성

- **Given**: Job A가 pending 상태이다
- **When**: in_progress로 전환한다 (사유: "작업 시작")
- **Then**: JobHistory 레코드가 생성된다 (from_status: pending, to_status: in_progress, reason: "작업 시작")
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-HIST-002: reason 필수 검증

- **Given**: Job A의 상태를 전환하려 한다
- **When**: reason이 빈 문자열 또는 undefined인 History 생성을 시도한다
- **Then**: 에러가 발생한다 (reason은 최소 1글자 이상 필수, 빈 문자열 거부)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-HIST-003: Job별 전체 History 조회

- **Given**: Job A에 대해 3번의 상태 전환이 발생했다
- **When**: Job A의 History를 조회한다
- **Then**: 3개의 History 레코드가 occurred_at 순으로 반환된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-HIST-004: 기간별 History 조회

- **Given**: 2026-03-01 ~ 2026-03-15 사이에 5건의 전환이 발생했다
- **When**: 해당 기간으로 필터하여 조회한다
- **Then**: 5건의 History가 반환된다
- **Phase**: 2
- **테스트 레벨**: 단위

---

### 2.4 CategoryService

#### UC-CAT-001: 기본 카테고리 시드 생성

- **Given**: 빈 CategoryRepository
- **When**: CategoryService.seedDefaults()를 호출한다
- **Then**: "개발", "분석", "회의", "기타" 4개의 카테고리가 생성되고, 각각 sort_order가 1~4로 설정된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CAT-002: 카테고리 트리 깊이 10 제한

- **Given**: 깊이 9인 Category 체인이 존재한다
- **When**: 깊이 10으로 새 카테고리를 생성한다
- **Then**: 성공한다
- **And When**: 깊이 11로 생성을 시도한다
- **Then**: ValidationError가 발생한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CAT-003: 카테고리 비활성화

- **Given**: "개발" 카테고리가 활성 상태이다
- **When**: is_active를 false로 변경한다
- **Then**: 카테고리 조회 시 is_active: false로 반환되고, 셀렉터 UI용 활성 카테고리 목록에서 제외된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CAT-004: 카테고리 정렬 순서 변경

- **Given**: "개발"(sort_order: 1), "분석"(sort_order: 2), "회의"(sort_order: 3) 카테고리가 존재한다
- **When**: "회의"의 sort_order를 1로 변경한다
- **Then**: getCategories()가 sort_order 기준으로 정렬된 목록을 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

---

### 2.5 TimeEntryService (Phase 3)

> **strategy 결정 흐름**: `resolveOverlap`의 strategy 파라미터(`new_first` / `existing_first`)는 UI 레이어의 OverlapResolutionModal에서 **사용자 선택**에 의해 결정됩니다. 아래 단위 테스트는 각 strategy별 순수 로직을 검증하며, 사용자 선택 → strategy 전달 → 결과 반영의 통합 흐름은 UC-UI-014~016(컴포넌트 테스트)에서 검증합니다.

#### UC-ENTRY-001: 시간 중복(overlap) 감지 - 부분 중복

- **Given**: Job A에 TimeEntry가 존재한다 (10:00~12:00)
- **When**: detectOverlaps("11:00", "13:00")를 호출한다
- **Then**: 기존 TimeEntry가 중복 목록에 포함된다 (부분 중복)
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-002: resolveOverlap - new_first 전략

- **Given**: 기존 TimeEntry(10:00~12:00)와 새 TimeEntry(11:00~13:00)가 중복한다
- **When**: resolveOverlap(new_entry, [existing], 'new_first')를 호출한다
- **Then**: 기존 TimeEntry의 ended_at이 11:00으로 잘리고, 새 TimeEntry는 원본 유지된다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-002a: resolveOverlap - 완전 포함(contain) 시 분할

- **Given**: 기존 TimeEntry(09:00~14:00)와 새 TimeEntry(10:00~12:00)가 완전 포함 관계이다
- **When**: resolveOverlap(new_entry, [existing], 'new_first')를 호출한다
- **Then**: 기존 TimeEntry가 두 구간(09:00~10:00, 12:00~14:00)으로 분할되고, 새 TimeEntry(10:00~12:00)는 원본 유지된다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-002b: resolveOverlap - existing_first 전략

- **Given**: 기존 TimeEntry(10:00~12:00)와 새 TimeEntry(11:00~13:00)가 중복한다
- **When**: resolveOverlap(new_entry, [existing], 'existing_first')를 호출한다
- **Then**: 새 TimeEntry의 started_at이 12:00으로 조정되고, 기존 TimeEntry는 변경 없다
    - 참고: 동일 중복 시나리오에서 사용자가 "현재 입력 우선"을 선택하면 기존 TimeEntry가 변경됨 (UC-ENTRY-002, UC-UI-015 참조)
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-003: 수동 TimeEntry 생성 시 duration_seconds 자동 계산

- **Given**: Job A와 Category가 존재한다
- **When**: createManualEntry({ started_at: "2026-03-15T10:00:00Z", ended_at: "2026-03-15T11:30:00Z" })를 호출한다
- **Then**: 생성된 TimeEntry의 duration_seconds가 5400(90분)이다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-ENTRY-004: ended_at < started_at 거부

- **Given**: Job A와 Category가 존재한다
- **When**: createManualEntry({ started_at: "2026-03-15T12:00:00Z", ended_at: "2026-03-15T10:00:00Z" })를 호출한다
- **Then**: ValidationError가 발생한다 (ended_at은 started_at 이후여야 함)
- **Phase**: 3
- **테스트 레벨**: 단위

---

### 2.6 MemoryStorageAdapter

#### UC-STORE-001: Job CRUD 전체 동작

- **Given**: 빈 MemoryStorageAdapter
- **When**: Job을 생성 → 조회 → 수정 → 삭제한다
- **Then**: 각 단계에서 정상 동작하고, 삭제 후 조회 시 null을 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-002: 존재하지 않는 id 조회

- **Given**: 빈 MemoryStorageAdapter
- **When**: 존재하지 않는 id로 Job을 조회한다
- **Then**: null을 반환한다 (에러 아님)
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-003: 상태별 필터링

- **Given**: in_progress 1개, paused 2개, pending 1개의 JobStatus가 저장되어 있다
- **When**: status === 'paused'로 필터하여 조회한다
- **Then**: 2개의 결과가 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-004: TimeEntry 저장 및 기간 조회

- **Given**: 2026-03-10, 2026-03-12, 2026-03-14에 각각 TimeEntry가 저장되어 있다
- **When**: 2026-03-11 ~ 2026-03-13 기간으로 조회한다
- **Then**: 2026-03-12의 1건만 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STORE-005: Category 삭제 시 참조 검사

- **Given**: Category "개발"이 있고, TimeEntry 1건이 해당 category_id를 참조한다
- **When**: Category "개발"을 삭제하려 시도한다
- **Then**: 에러가 발생한다 (참조 레코드가 존재하므로 삭제 거부)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-STORE-006: Storage fallback 전환 (SQLite → Memory)

- **Given**: OpfsSqliteStorageAdapter 초기화가 실패한다 (OPFS 접근 불가 시뮬레이션)
- **When**: 앱이 초기화를 시도한다
- **Then**: MemoryStorageAdapter로 자동 전환되고, 사용자에게 "임시 모드" 토스트가 표시된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-STORE-007: Export/Import 라운드트립

- **Given**: Job 2건, TimeEntry 3건, Category 4건이 저장되어 있다
- **When**: exportData() → 결과를 importData()로 재가져오기한다
- **Then**: 모든 레코드가 정확히 복원되고, 데이터 정합성이 유지된다
- **Phase**: 2
- **테스트 레벨**: 단위

---

### 2.7 타입 검증

#### UC-TYPE-001: 유효한 StatusKind 전환

- **Given**: 유효한 전환 쌍 (pending → in_progress, in_progress → paused 등)
- **When**: 전환 유효성을 검사한다
- **Then**: true를 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TYPE-002: 잘못된 StatusKind 전환

- **Given**: 잘못된 전환 쌍 (completed → in_progress, cancelled → paused 등)
- **When**: 전환 유효성을 검사한다
- **Then**: false를 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TYPE-003: ISO8601 문자열 검증

- **Given**: 유효한 ISO8601 문자열 "2026-03-15T10:30:00+09:00"
- **When**: 검증 함수를 호출한다
- **Then**: true를 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-TYPE-004: 잘못된 ISO8601 문자열 거부

- **Given**: 잘못된 문자열 "2026/03/15", "not-a-date"
- **When**: 검증 함수를 호출한다
- **Then**: false를 반환한다
- **Phase**: 1
- **테스트 레벨**: 단위

---

### 2.8 JobCategoryService (Phase 2)

#### UC-JCAT-001: Job-Category 연결 생성

- **Given**: Job A와 Category "개발"이 존재한다
- **When**: JobCategoryService.link(job_a_id, category_dev_id)를 호출한다
- **Then**: JobCategory 레코드가 생성되고, is_default는 false이다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JCAT-002: is_default 유일성 보장

- **Given**: Job A에 Category "개발"(is_default: true)이 연결되어 있다
- **When**: Category "분석"을 is_default: true로 연결한다
- **Then**: "분석"이 is_default: true가 되고, "개발"의 is_default가 false로 변경된다 (동일 Job 내 is_default는 1개만)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JCAT-003: 존재하지 않는 Job/Category 연결 거부

- **Given**: 존재하지 않는 job_id 또는 category_id
- **When**: link(invalid_job_id, category_id)를 호출한다
- **Then**: ValidationError가 발생한다
- **Phase**: 2
- **테스트 레벨**: 단위

---

### 2.9 DataFieldService (Phase 3)

#### UC-DFIELD-001: 커스텀 필드 생성

- **Given**: EntityType "job"이 존재한다
- **When**: DataFieldService.createField({ entity_type_id, key: "priority", data_type: "enum", options: ["high", "medium", "low"] })를 호출한다
- **Then**: DataField 레코드가 생성되고, is_system: false이다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-DFIELD-002: 시스템 필드 삭제 거부

- **Given**: is_system: true인 DataField "title"이 존재한다
- **When**: DataFieldService.deleteField(title_field_id)를 호출한다
- **Then**: ValidationError가 발생한다 (시스템 필드는 삭제 불가)
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-DFIELD-003: (entity_type_id, key) 유일성 검증

- **Given**: EntityType "job"에 key "priority" DataField가 이미 존재한다
- **When**: 동일 entity_type_id와 key "priority"로 새 DataField를 생성하려 한다
- **Then**: ValidationError가 발생한다 (동일 엔티티 내 key 중복 불가)
- **Phase**: 3
- **테스트 레벨**: 단위

---

### 2.10 TemplateService (Phase 4)

#### UC-TMPL-001: 템플릿 CRUD 기본 동작

- **Given**: TemplateService가 초기화되어 있다
- **When**: 템플릿을 생성 → 조회 → 수정 → 삭제한다
- **Then**: 각 단계에서 정상 동작하고, 삭제 후 조회 시 null을 반환한다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-TMPL-002: 플레이스홀더 치환

- **Given**: `"## {{job_title}} 작업 보고"` 내용의 템플릿이 존재한다
- **When**: renderTemplate(template_id, { job_title: "API 개발" })을 호출한다
- **Then**: `"## API 개발 작업 보고"` 문자열이 반환된다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-TMPL-003: XSS 방지 - 위험 태그 필터링

- **Given**: 템플릿이 존재한다
- **When**: renderTemplate에 `{ job_title: "<script>alert('xss')</script>" }` 값을 전달한다
- **Then**: `<script>` 태그가 이스케이프 처리되어 `&lt;script&gt;` 형태로 반환된다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-TMPL-004: 존재하지 않는 플레이스홀더 키 처리

- **Given**: `"{{job_title}} - {{unknown_field}}"` 내용의 템플릿이 존재한다
- **When**: renderTemplate(template_id, { job_title: "테스트" })을 호출한다 (unknown_field 미제공)
- **Then**: 존재하지 않는 플레이스홀더는 빈 문자열로 치환되거나 원본 유지되며, 에러는 발생하지 않는다
- **Phase**: 4
- **테스트 레벨**: 단위

---

### 2.11 StatisticsService

#### UC-STAT-001: Job별 누적 시간 조회

- **Given**: Job A에 3건의 TimeEntry가 있다 (합계 7200초)
- **When**: getJobDuration(job_a_id)을 호출한다
- **Then**: total_seconds가 7200이고, entry_count가 3인 DurationSummary가 반환된다
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-STAT-002: Category별 누적 시간 조회

- **Given**: Category "개발"에 속한 TimeEntry가 5건 있다 (합계 18000초)
- **When**: getCategoryDuration(category_dev_id)을 호출한다
- **Then**: total_seconds가 18000이고, entry_count가 5인 DurationSummary가 반환된다
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-STAT-003: Job 내 카테고리 분포 조회

- **Given**: Job A에 "개발" 3600초, "분석" 1800초의 TimeEntry가 있다
- **When**: getJobCategoryBreakdown(job_a_id)을 호출한다
- **Then**: 2개의 CategoryBreakdown이 반환되고, "개발" percentage가 약 66.7%, "분석"이 약 33.3%이다
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-STAT-004: 일별 요약 조회

- **Given**: 2026-03-10 ~ 2026-03-12에 각각 TimeEntry가 존재한다
- **When**: getDailySummary({ from: '2026-03-10', to: '2026-03-12' })를 호출한다
- **Then**: 3일치의 DailySummary가 반환되고, 각 날짜별 total_seconds와 entries가 포함된다
- **Phase**: 5
- **테스트 레벨**: 단위

---

### 2.12 스키마 마이그레이션 (Phase 2)

#### UC-MIGRATE-001: 마이그레이션 순차 실행

- **Given**: DB 스키마 버전이 1이고, 마이그레이션 2, 3이 정의되어 있다
- **When**: 앱이 초기화되어 마이그레이션을 실행한다
- **Then**: 마이그레이션 2 → 3이 순서대로 실행되고, 스키마 버전이 3으로 갱신된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-MIGRATE-002: Export 버전 마이그레이션

- **Given**: ExportData 버전 1 형식의 JSON이 있다 (현재 앱은 버전 2)
- **When**: importData(v1_json)을 호출한다
- **Then**: migrateExportData() 체인이 v1 → v2로 변환한 뒤 정상 임포트된다
- **Phase**: 2
- **테스트 레벨**: 단위

---

## 3. time-tracker-core: 통합 테스트

### 3.1 서비스 간 협업

#### UC-FSM-001: 전체 상태 전환 흐름

- **Given**: MemoryStorageAdapter, JobService, HistoryService, TimerService가 연결되어 있다
- **When**: pending → in_progress → paused → in_progress → completed 순서로 전환한다
- **Then**: 각 전환마다 JobHistory가 생성되고, 최종 4개의 History 레코드가 존재하며, 모든 reason이 비어있지 않다
- **Phase**: 1
- **테스트 레벨**: 통합

#### UC-FSM-002: 두 Job 간 자동 전환

- **Given**: Job A가 in_progress 상태이다
- **When**: Job B를 시작한다 (사유: "우선순위 변경")
- **Then**: Job A에 대해 paused History가 생성되고, Job B에 대해 in_progress History가 생성된다. Storage에서 in_progress 상태의 JobStatus는 Job B 1개만 존재한다
- **Phase**: 1
- **테스트 레벨**: 통합

#### UC-FSM-003: TimerService + Storage 연동

- **Given**: TimerService와 MemoryStorageAdapter가 연결되어 있다
- **When**: 타이머 시작 → 일정 시간 경과 → 정지한다
- **Then**: TimeEntry가 Storage에 저장되고, started_at/ended_at/duration_seconds가 정합성을 유지한다
- **Phase**: 1
- **테스트 레벨**: 통합

#### UC-FSM-004: JobService + HistoryService 자동 기록

- **Given**: JobService와 HistoryService가 연결되어 있다
- **When**: Job의 상태를 3번 전환한다
- **Then**: HistoryService를 통해 조회 시 3개의 History 레코드가 순서대로 반환된다
- **Phase**: 2
- **테스트 레벨**: 통합

### 3.2 Store + Service 반응형

#### UC-FSM-005: TimerStore 반응형 동기화

- **Given**: TimerStore가 TimerService에 바인딩되어 있다
- **When**: TimerService.start()를 호출한다
- **Then**: TimerStore의 active_job, started_at, is_paused 값이 즉시 반영된다
- **Phase**: 1
- **테스트 레벨**: 통합

#### UC-FSM-006: JobStore 반응형 동기화

- **Given**: JobStore가 JobService에 바인딩되어 있다
- **When**: JobService.createJob()을 호출한다
- **Then**: JobStore의 jobs 목록에 새 Job이 즉시 추가된다
- **Phase**: 2
- **테스트 레벨**: 통합

---

## 4. time-tracker-core: 컴포넌트 테스트

### 4.1 Timer

#### UC-UI-001: Timer 초기 렌더링

- **Given**: Timer 컴포넌트가 초기 상태 (is_running: false)로 렌더링된다
- **When**: 화면이 표시된다
- **Then**: "시작" 버튼이 보이고, 경과시간은 "00:00:00"으로 표시된다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-UI-002: Timer 시작 버튼 클릭

- **Given**: Timer가 정지 상태이다
- **When**: "시작" 버튼을 클릭한다
- **Then**: onStart 콜백이 호출된다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-UI-003: Timer 진행 중 상태 표시

- **Given**: Timer가 is_running: true, elapsed_seconds: 3661 (1시간 1분 1초)로 렌더링된다
- **When**: 화면이 표시된다
- **Then**: "01:01:01"이 표시되고, "일시정지" 버튼이 보인다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

### 4.2 JobList

#### UC-UI-004: Job 목록 렌더링

- **Given**: 3개의 Job (in_progress 1개, paused 1개, pending 1개)이 있다
- **When**: JobList가 렌더링된다
- **Then**: 3개의 Job 항목이 표시되고, 각 상태가 구분되어 표시된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-UI-005: Job 상태 필터링

- **Given**: JobList에 5개의 Job이 있다 (in_progress 1, paused 2, pending 2)
- **When**: "paused" 필터를 선택한다
- **Then**: paused 상태인 2개의 Job만 표시된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-UI-006: Job 클릭 시 스위칭

- **Given**: Job A (paused)가 목록에 있다
- **When**: Job A를 클릭한다
- **Then**: onSwitch 콜백이 Job A의 id와 함께 호출된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

### 4.3 TimeEntryForm

#### UC-UI-007: TimeEntryForm 입력 검증

- **Given**: TimeEntryForm이 렌더링되어 있다
- **When**: started_at만 입력하고 ended_at을 비워둔 채 제출한다
- **Then**: 유효성 에러가 표시되고 제출되지 않는다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-UI-008: TimeEntryForm 정상 제출

- **Given**: TimeEntryForm에 모든 필수 필드가 입력되어 있다 (started_at, ended_at, category)
- **When**: 제출 버튼을 클릭한다
- **Then**: onSubmit 콜백이 입력값과 함께 호출된다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

### 4.4 셀렉터

#### UC-UI-009: 폴더 중첩 탐색

- **Given**: "프로젝트 > 메인업무 > 작업" 구조의 Category 트리가 있다
- **When**: "프로젝트"를 클릭 → "메인업무"를 클릭한다
- **Then**: "작업" 레벨의 항목들이 표시된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-010: 셀렉터 검색

- **Given**: 10개 이상의 Category 항목이 있다
- **When**: 검색창에 "개발"을 입력한다
- **Then**: "개발"을 포함하는 항목만 필터되어 표시된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

### 4.5 데이트피커

#### UC-UI-011: 날짜 선택

- **Given**: DatePicker가 렌더링되어 있다
- **When**: 2026-03-15를 선택한다
- **Then**: onSelect 콜백이 "2026-03-15" 값과 함께 호출된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-012: 날짜 범위 검증

- **Given**: DatePicker에 min: "2026-01-01", max: "2026-12-31" 제약이 있다
- **When**: 2025-12-31을 선택하려 한다
- **Then**: 선택이 불가하다 (비활성 또는 에러)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

### 4.6 수동 TimeEntry 입력

#### UC-UI-013: 수동 TimeEntry 정상 생성 (중복 없음)

- **Given**: 수동 입력 폼에 Job, Category, 시작 10:00, 종료 12:00를 입력했다. 해당 시간에 기존 TimeEntry가 없다
- **When**: 제출 버튼을 클릭한다
- **Then**: TimeEntry가 생성되고 목록에 추가된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-014: 수동 TimeEntry 시간 중복 감지

- **Given**: 기존 TimeEntry가 11:00~13:00에 존재한다
- **When**: 수동으로 10:00~12:00를 제출한다
- **Then**: OverlapResolutionModal이 표시되고, 중복 구간(11:00~12:00)이 시각적으로 표시된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-015: 현재 입력 우선 선택 시 기존 TimeEntry 조정

- **Given**: OverlapResolutionModal이 표시된 상태이다 (새: 10:00~12:00, 기존: 11:00~13:00)
- **When**: "현재 입력 우선"을 선택한다
- **Then**: 새 TimeEntry 10:00~12:00가 생성되고, 기존 TimeEntry가 12:00~13:00로 조정된다
    - 서비스 레벨 검증: UC-ENTRY-002 (new_first 단위 테스트)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-016: 기존 입력 우선 선택 시 새 TimeEntry 조정

- **Given**: OverlapResolutionModal이 표시된 상태이다 (새: 10:00~12:00, 기존: 11:00~13:00)
- **When**: "기존 입력 우선"을 선택한다
- **Then**: 새 TimeEntry가 10:00~11:00로 조정되어 생성되고, 기존 TimeEntry는 변경 없다
    - 서비스 레벨 검증: UC-ENTRY-002b (existing_first 단위 테스트)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-017: 새 입력이 기존 TimeEntry를 완전 포함

- **Given**: 기존 TimeEntry가 11:00~13:00에 존재한다
- **When**: 수동으로 10:00~14:00를 제출하고 "현재 입력 우선"을 선택한다
- **Then**: 새 TimeEntry 10:00~14:00가 생성되고, 기존 TimeEntry는 삭제된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-UI-018: 기존 TimeEntry가 새 입력을 완전 포함

- **Given**: 기존 TimeEntry가 09:00~15:00에 존재한다
- **When**: 수동으로 11:00~13:00를 제출하고 "기존 입력 우선"을 선택한다
- **Then**: 새 TimeEntry는 생성되지 않는다 (중복 구간 제거 후 남는 시간 없음 → 취소와 동일)
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

---

## 5. logseq-time-tracker: 단위/통합 테스트

### 5.1 플러그인 초기화

#### UC-PLUGIN-001: logseq.ready 호출

- **Given**: Logseq 환경이 모킹되어 있다
- **When**: main.ts가 실행된다
- **Then**: logseq.ready()가 호출되고, 콜백 내에서 UI/커맨드 등록이 수행된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-PLUGIN-002: 툴바 아이템 등록

- **Given**: logseq.ready 콜백이 실행된다
- **When**: 초기화가 완료된다
- **Then**: logseq.App.registerUIItem이 toolbar 타입으로 호출된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-PLUGIN-003: 명령어 팔레트 등록

- **Given**: logseq.ready 콜백이 실행된다
- **When**: 초기화가 완료된다
- **Then**: logseq.App.registerCommandPalette이 풀화면 전환 명령으로 호출된다
- **Phase**: 2
- **테스트 레벨**: 단위

### 5.2 LogseqStorageAdapter

#### UC-PLUGIN-004: Logseq 블록을 Job으로 변환

- **Given**: Logseq 블록 데이터가 모킹되어 있다 (properties 포함)
- **When**: LogseqStorageAdapter.getJob(block_uuid)을 호출한다
- **Then**: 블록 데이터가 Job 인터페이스에 맞게 변환되어 반환된다
- **Phase**: 4
- **테스트 레벨**: 단위

#### UC-PLUGIN-005: Job을 Logseq 블록으로 저장

- **Given**: Job 데이터가 있다
- **When**: LogseqStorageAdapter.saveJob(job)을 호출한다
- **Then**: logseq.Editor API가 올바른 property와 함께 호출된다
- **Phase**: 4
- **테스트 레벨**: 단위

### 5.3 플러그인 통합

#### UC-PLUGIN-006: App 마운트 및 스토어 초기화

- **Given**: Logseq 환경이 모킹되어 있다
- **When**: main.ts → logseq.ready → App.svelte 마운트가 실행된다
- **Then**: App이 정상 렌더링되고, TimerStore/JobStore가 초기 상태로 설정된다
- **Phase**: 1
- **테스트 레벨**: 통합

---

## 6. E2E 테스트

### 6.1 타이머 플로우

#### UC-E2E-001: 타이머 시작 → 경과 → 정지 → 기록 확인

- **Given**: Logseq 플러그인이 로드된 상태이다
- **When**: 시작 클릭 → 3초 대기 → 정지 클릭
- **Then**: 경과시간이 0초보다 크게 표시되었다가, 정지 후 TimeEntry가 저장된다
- **Phase**: 2
- **테스트 레벨**: E2E

### 6.2 작업 전환

#### UC-E2E-002: Job A → Job B 전환 및 자동 일시정지

- **Given**: Job A가 in_progress 상태이다
- **When**: Job B의 "시작" 버튼을 클릭하고 사유를 입력한다
- **Then**: Job A가 paused로 표시되고, Job B가 in_progress로 표시되며, History에 전환 기록이 존재한다
- **Phase**: 2
- **테스트 레벨**: E2E

### 6.3 잡 생성

#### UC-E2E-003: 잡 생성 → 정보 입력 → 트래킹 시작

- **Given**: 풀화면 UI가 열려 있다
- **When**: "잡 생성" → 제목/카테고리 입력 → 확인 → "시작" 클릭
- **Then**: 새 Job이 생성되고, 페이지가 생성되며, 타이머가 시작된다
- **Phase**: 3
- **테스트 레벨**: E2E

### 6.4 통계

#### UC-E2E-004: 기간별 통계 표시

- **Given**: 지난 7일간 여러 TimeEntry가 존재한다
- **When**: 풀화면에서 "이번 주" 기간을 선택한다
- **Then**: 작업별/카테고리별 누적 시간이 표시된다
- **Phase**: 4
- **테스트 레벨**: E2E

### 6.5 툴바

#### UC-E2E-005: 툴바에서 현재 작업 확인 및 전환

- **Given**: Job A가 in_progress 상태이다
- **When**: 툴바 아이콘을 클릭한다
- **Then**: 현재 진행 중인 Job A 정보가 표시되고, 다른 작업으로 전환하거나 풀화면을 열 수 있다
- **Phase**: 4
- **테스트 레벨**: E2E

---

## 7. Phase별 유즈케이스 요약

| Phase | 단위                                                                                                                                                                                                     | 통합                                      | 컴포넌트                        | E2E            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------- | -------------- |
| **1** | UC-TIMER-001~010, UC-JOB-001~002, UC-CAT-001~004, UC-STORE-001~004, UC-TYPE-001~004, UC-PLUGIN-001~002, UC-EDGE-001, UC-EDGE-003, UC-EDGE-007, UC-CANCEL-001~003, UC-STOP-001~002, UC-CATEGORY-CYCLE-001 | UC-FSM-001~003, UC-FSM-005, UC-PLUGIN-006 | UC-UI-001~003, UC-TOAST-001~003 | -              |
| **2** | UC-JOB-003~010, UC-JCAT-001~003, UC-HIST-001~004, UC-STORE-005~007, UC-MIGRATE-001~002, UC-PLUGIN-003, UC-EDGE-002, UC-EDGE-004~006, UC-EDGE-008                                                         | UC-FSM-004, UC-FSM-006                    | UC-UI-004~008                   | UC-E2E-001~002 |
| **3** | UC-ENTRY-001~004, UC-DFIELD-001~003                                                                                                                                                                      | -                                         | UC-UI-009~018                   | UC-E2E-003     |
| **4** | UC-TMPL-001~004, UC-PLUGIN-004~005                                                                                                                                                                       | UC-REMIND-001~003                         | -                               | UC-E2E-004~005 |
| **5** | UC-STAT-001~004, UC-EXPORT-001, UC-EXPORT-003                                                                                                                                                            | UC-EXPORT-002                             | -                               | -              |

---

## 8. 엣지 케이스 테스트

### 8.1 동시성 & 성능

#### UC-EDGE-001: 100ms 간격 연속 상태 전환

- **Given**: Job A가 in_progress 상태이다
- **When**: 100ms 간격으로 pause → resume → pause → resume를 4회 반복한다
- **Then**: 모든 전환이 순서대로 처리되고, 4개의 History 레코드가 올바른 순서로 생성되며, 최종 상태가 일관된다
- **Phase**: 1
- **테스트 레벨**: 단위

### 8.2 타임존

#### UC-EDGE-002: DST 전환 시점의 duration_seconds 정합성

- **Given**: 타이머가 UTC 기준으로 시작되었다
- **When**: DST 전환 시점(예: UTC+9 → UTC+10)을 포함하는 구간에서 타이머를 정지한다
- **Then**: duration_seconds가 UTC 기준 (ended_at - started_at)으로 정확히 계산된다 (DST 영향 없음)
- **Phase**: 2
- **테스트 레벨**: 단위

### 8.3 데이터 모델 경계값

#### UC-EDGE-003: Category 깊이 10 생성 및 11 거부

- **Given**: 깊이 9인 Category 체인이 존재한다 (root → cat1 → ... → cat9)
- **When**: cat9의 자식으로 cat10을 생성한다 (깊이 10)
- **Then**: 성공한다
- **And When**: cat10의 자식으로 cat11을 생성하려 시도한다 (깊이 11)
- **Then**: ValidationError가 발생한다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-EDGE-004: custom_fields 손상된 JSON 파싱 시 에러 핸들링

- **Given**: Job의 custom_fields에 `"{invalid json"`이 저장되어 있다
- **When**: Job을 조회하여 custom_fields를 파싱한다
- **Then**: 에러가 발생하지 않고, custom_fields는 빈 객체 `{}`로 fallback된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-EDGE-005: ExternalRef 동일 (job_id, system_key) 중복 삽입 거부

- **Given**: Job A에 system_key="logseq"인 ExternalRef가 존재한다
- **When**: 동일한 (job_id, system_key) 조합으로 새 ExternalRef를 삽입하려 시도한다
- **Then**: 에러가 발생하거나 기존 레코드가 업데이트된다 (upsert 동작)
- **Phase**: 2
- **테스트 레벨**: 단위

### 8.4 상태 전환

#### UC-EDGE-006: pending → completed 사후 기록 흐름

- **Given**: Job A가 pending 상태이다
- **When**: 사유 "이미 완료된 작업"으로 completed 전환을 시도한다
- **Then**: Job A가 completed로 전환되고, JobHistory에 pending → completed 기록이 생성된다 (in_progress를 거치지 않음)
- **Phase**: 2
- **테스트 레벨**: 단위

### 8.5 비정상 종료 복구

#### UC-EDGE-007: 비정상 종료 후 ActiveTimerState 복구 (paused 상태)

- **Given**: ActiveTimerState가 Storage에 저장되어 있다 (job_id: A, is_paused: true, accumulated_ms: 120000)
- **When**: 앱이 재시작되고 초기화된다
- **Then**: TimerStore에 Job A가 paused 상태로 복원되고, 경과 시간이 120초로 표시된다 (paused이므로 시간 증가 없음)
- **Phase**: 1
- **테스트 레벨**: 단위

### 8.6 Cascade 삭제

#### UC-EDGE-008: Job 삭제 시 ExternalRef cascade 삭제 확인

- **Given**: Job A에 ExternalRef 2건 (logseq, ecount)이 연결되어 있다
- **When**: Job A를 삭제한다 (pending 상태)
- **Then**: ExternalRef 2건도 함께 삭제된다
- **Phase**: 2
- **테스트 레벨**: 단위

---

## 9. 알림 & 리마인더 테스트

#### UC-REMIND-001: N시간 연속 타이머 알림 트리거

- **Given**: 알림 설정이 4시간으로 되어 있다
- **When**: 타이머가 4시간 이상 연속 실행된다
- **Then**: 장시간 타이머 알림이 트리거된다
- **Phase**: 4
- **테스트 레벨**: 통합

#### UC-REMIND-002: 방치된 작업 리마인더 트리거

- **Given**: Job A가 in_progress 상태이고, 알림 설정이 8시간이다
- **When**: 타이머 미실행 상태로 8시간이 경과한다
- **Then**: 방치 작업 리마인더가 트리거된다
- **Phase**: 4
- **테스트 레벨**: 통합

#### UC-REMIND-003: 알림 설정 변경 반영

- **Given**: 장시간 타이머 알림이 4시간으로 설정되어 있다
- **When**: 사용자가 2시간으로 변경한다
- **Then**: 변경 즉시 반영되어, 현재 실행 중인 타이머가 2시간 초과 시 알림이 트리거된다
- **Phase**: 4
- **테스트 레벨**: 통합

---

## 10. 성능 테스트

NFR-4.1에 따른 성능 검증 유즈케이스입니다.

### 10.1 주요 액션 응답 시간

#### UC-PERF-001: 타이머 시작 응답 시간

- **Given**: 앱이 정상 로드된 상태이다
- **When**: 타이머 시작 버튼을 클릭한다
- **Then**: UI가 200ms 이내에 반응한다 (`performance.measure` 기준)
- **Phase**: 2
- **테스트 레벨**: E2E

#### UC-PERF-002: Job 전환 응답 시간

- **Given**: Job A가 in_progress 상태이다
- **When**: Job B로 전환한다 (reason 포함)
- **Then**: 전환 완료 (UI 갱신 포함)가 200ms 이내이다
- **Phase**: 2
- **테스트 레벨**: E2E

#### UC-PERF-003: 대량 Job 목록 렌더링

- **Given**: 100개의 Job이 존재한다
- **When**: JobList 컴포넌트를 렌더링한다
- **Then**: 초기 렌더링이 500ms 이내에 완료된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-PERF-004: SQLite 쿼리 성능 (대량 TimeEntry)

- **Given**: 10,000건의 TimeEntry가 존재한다
- **When**: 1개월 기간으로 필터 조회한다
- **Then**: 쿼리 결과가 500ms 이내에 반환된다
- **Phase**: 3
- **테스트 레벨**: 통합

---

## 11. 추가 결함 발견 테스트

설계 검증 과정에서 발견된 누락 시나리오를 보완합니다.

### 11.1 cancel() 동작 검증

#### UC-CANCEL-001: cancel 시 경과 시간 > 0이면 TimeEntry 생성

- **Given**: Job이 `in_progress`이고 경과 시간이 5분이다
- **When**: `TimerService.cancel(reason)` 호출
- **Then**: duration_seconds=300인 TimeEntry가 생성되고, note에 `"[cancelled]"` 접두사가 포함된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CANCEL-002: cancel 시 경과 시간 = 0이면 TimeEntry 미생성

- **Given**: Job이 `in_progress`이고 시작 직후(경과 0초)이다
- **When**: `TimerService.cancel(reason)` 호출
- **Then**: TimeEntry가 생성되지 않고 `null`이 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-CANCEL-003: cancel 시 FSM 전환 및 ActiveTimerState 정리

- **Given**: Job이 `in_progress` 또는 `paused` 상태이다
- **When**: `TimerService.cancel(reason)` 호출
- **Then**: Job.status가 `cancelled`로 전환, JobHistory에 reason 기록, ActiveTimerState가 `null`로 삭제된다
- **Phase**: 1
- **테스트 레벨**: 단위

### 11.2 paused→completed 및 0초 stop 검증

#### UC-STOP-001: paused 상태에서 완료 시 accumulated_ms로 TimeEntry 생성

- **Given**: Job이 `paused` 상태이고 `accumulated_ms = 60000` (1분)이다
- **When**: `TimerService.stop(reason)` 호출
- **Then**: duration_seconds=60인 TimeEntry가 생성된다
- **Phase**: 1
- **테스트 레벨**: 단위

#### UC-STOP-002: stop 시 duration_seconds = 0이면 TimeEntry 미생성

- **Given**: Job이 `in_progress`이고 시작 직후(경과 0초)이다
- **When**: `TimerService.stop(reason)` 호출
- **Then**: TimeEntry가 생성되지 않고 `null`이 반환된다
- **Phase**: 1
- **테스트 레벨**: 단위

### 11.3 Export 에러 케이스

#### UC-EXPORT-001: 빈 기간에 대한 내보내기

- **Given**: 선택한 기간에 TimeEntry가 0건이다
- **When**: `DataExportService.exportCSV(period)` 호출
- **Then**: 헤더만 포함된 빈 CSV가 생성되고, 토스트로 "해당 기간에 기록이 없습니다." 안내
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-EXPORT-002: 대량 데이터 내보내기 시 타임아웃

- **Given**: 10,000건 이상의 TimeEntry가 존재한다
- **When**: `DataExportService.exportCSV(period)` 호출
- **Then**: 30초 이내에 완료되거나, 타임아웃 시 `StorageError`와 토스트 표시
- **Phase**: 5
- **테스트 레벨**: 통합

#### UC-EXPORT-003: 내보내기 중 Storage 오류

- **Given**: Storage가 비정상 상태이다 (fallback 모드)
- **When**: 내보내기를 시도한다
- **Then**: MemoryAdapter의 현재 데이터로 내보내기가 수행되고, 배너에 "임시 모드 데이터입니다" 경고 포함
- **Phase**: 5
- **테스트 레벨**: 단위

### 11.4 Category 순환 참조 검증

#### UC-CATEGORY-CYCLE-001: 카테고리 이동 시 순환 참조 방지

- **Given**: 카테고리 A → B → C 트리가 존재한다
- **When**: 카테고리 A의 parent_id를 C로 변경 시도한다
- **Then**: `ValidationError("순환 참조가 감지되었습니다")`가 발생하고, 카테고리 구조는 변경되지 않는다
- **Phase**: 1
- **테스트 레벨**: 단위

### 11.5 토스트 시스템 검증

#### UC-TOAST-001: 토스트 FIFO 큐 3개 제한

- **Given**: 토스트가 3개 표시 중이다
- **When**: 4번째 토스트를 추가한다
- **Then**: 가장 오래된 토스트가 자동 제거되고, 새 토스트가 표시된다 (총 3개 유지)
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-TOAST-002: 동일 메시지 토스트 중복 방지

- **Given**: "저장에 실패했습니다." 토스트가 표시 중이다
- **When**: 동일 메시지의 토스트를 추가한다
- **Then**: 새 토스트가 생성되지 않고, 기존 토스트가 유지된다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-TOAST-003: error 레벨 토스트 수동 dismiss

- **Given**: error 레벨 토스트가 표시 중이다
- **When**: 5초가 경과한다
- **Then**: 토스트가 자동으로 사라지지 않고, X 버튼 클릭으로만 dismiss된다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

---

## 12. 접근성 테스트

06-ui-ux.md 접근성 가이드라인에 따른 검증 유즈케이스입니다.

### 12.1 키보드 네비게이션

#### UC-A11Y-001: Tab 키로 모든 인터랙티브 요소 접근

- **Given**: Timer 컴포넌트와 JobList가 렌더링되어 있다
- **When**: Tab 키를 반복 누른다
- **Then**: 모든 버튼, 입력 필드, 셀렉터에 포커스가 순서대로 이동한다
- **Phase**: 2
- **테스트 레벨**: 컴포넌트

#### UC-A11Y-002: ReasonModal 포커스 트랩

- **Given**: ReasonModal이 열려 있다
- **When**: Tab 키를 반복 누른다
- **Then**: 포커스가 모달 내부 요소(textarea, 확인, 취소)에서만 순환하고, 모달 바깥으로 이동하지 않는다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-A11Y-003: 모달 닫힘 시 포커스 복귀

- **Given**: ReasonModal이 열려 있다
- **When**: 모달을 닫는다 (확인 또는 취소)
- **Then**: 포커스가 모달을 트리거한 요소로 복귀한다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

### 12.2 ARIA 속성

#### UC-A11Y-004: Timer 컴포넌트 ARIA 역할

- **Given**: Timer 컴포넌트가 렌더링되어 있다
- **When**: 접근성 트리를 검사한다
- **Then**: 경과 시간 요소에 `role="timer"` 및 `aria-live="polite"`가 설정되어 있다
- **Phase**: 1
- **테스트 레벨**: 컴포넌트

#### UC-A11Y-005: 색상 대비 WCAG 2.1 AA

- **Given**: 앱의 모든 텍스트 요소가 렌더링되어 있다
- **When**: 색상 대비를 측정한다
- **Then**: 모든 텍스트가 배경 대비 4.5:1 이상이다
- **Phase**: 3
- **테스트 레벨**: E2E
