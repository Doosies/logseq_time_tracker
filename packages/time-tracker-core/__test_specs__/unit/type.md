# 타입 검증 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

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
