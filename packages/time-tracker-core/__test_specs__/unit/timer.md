# Timer 서비스 (cancel/stop 포함) 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

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
