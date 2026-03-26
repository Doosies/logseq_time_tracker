# MemoryStorageAdapter 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

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

### JobStore (createJobStore)

#### UC-STORE-008: 초기 상태: jobs 빈 배열, selected_job null
#### UC-STORE-009: setJobs: jobs 배열 설정
#### UC-STORE-010: selectJob: selected_job_id 설정 → selected_job derived 동작
#### UC-STORE-011: addJob: jobs 배열에 추가
#### UC-STORE-012: removeJob: jobs에서 제거 + 선택 해제
#### UC-STORE-013: updateJobInList: 기존 Job 업데이트
#### UC-STORE-014: active_job derived: status === in_progress인 Job 반환
#### UC-STORE-015: pending_jobs derived: status === pending인 Job 배열
#### UC-STORE-016: paused_jobs derived: status === paused인 Job 배열

---

### TimerStore (createTimerStore)

#### UC-STORE-017: 초기 상태: active_job null, is_running false
#### UC-STORE-018: startTimer: active_job 설정, is_running true, accumulated_ms 0
#### UC-STORE-019: pauseTimer: is_paused true, accumulated_ms에 경과 시간 누적
#### UC-STORE-020: resumeTimer: is_paused false, current_segment_start 설정
#### UC-STORE-021: stopTimer: 모든 상태 초기화
#### UC-STORE-022: cancelTimer: 모든 상태 초기화
#### UC-STORE-023: restore: 일시정지 상태 복구 시 current_segment_start null
#### UC-STORE-024: restore: 실행 중 복구 시 current_segment_start 설정
#### UC-STORE-025: is_running derived: active_job 있고 is_paused false일 때 true

---

### StorageManager

#### UC-STORE-026: SQLite 초기화 실패 시 MemoryUnitOfWork와 memory_fallback 상태
#### UC-STORE-027: tryRecover는 memory_fallback이 아니면 false
#### UC-STORE-028: tryRecover: SQLite 재오픈 후 메모리 데이터를 병합

---

### StorageStateMachine

#### UC-STORE-029: 초기 상태는 sqlite
#### UC-STORE-030: transitionToFallback → memory_fallback 및 구독자 호출
#### UC-STORE-031: subscribe 해제 후 알림 없음
#### UC-STORE-032: transitionToSqlite로 복귀

---

### WebLocksManager

#### UC-STORE-033: navigator.locks 없으면 미지원이고 acquireLock은 true 후 release
