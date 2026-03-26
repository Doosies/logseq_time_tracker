# FSM·서비스·Store 통합 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: integration
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

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
