# 엣지 케이스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: edge-cases
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

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
