# 유틸리티 함수 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-UTIL-{번호}` (3자리 zero-padded)

---

## generateId

#### UC-UTIL-001: UUID v4 형식의 문자열을 반환해야 함
#### UC-UTIL-002: 연속 호출 시 서로 다른 값을 반환해야 함

## sanitizeText

#### UC-UTIL-003: HTML 태그를 제거하고 앞뒤 공백을 trim해야 함
#### UC-UTIL-004: max_length를 초과하면 ValidationError를 던져야 함
#### UC-UTIL-005: 길이가 max_length 이하이면 정제된 문자열을 반환해야 함

## runWithExponentialBackoff

#### UC-UTIL-006: 첫 시도 성공 시 sleep 없음
#### UC-UTIL-007: 2번 실패 후 성공
#### UC-UTIL-008: max_attempts 소진 시 마지막 에러 전파
