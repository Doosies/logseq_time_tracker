# Job 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

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
