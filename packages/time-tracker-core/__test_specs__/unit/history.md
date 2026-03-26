# History 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

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
