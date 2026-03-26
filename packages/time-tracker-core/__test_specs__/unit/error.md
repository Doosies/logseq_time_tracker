# 에러 클래스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-ERR-{번호}` (3자리 zero-padded)

---

#### UC-ERR-001: TimeTrackerError: name, code, message
#### UC-ERR-002: ValidationError: name, code, field
#### UC-ERR-003: StateTransitionError: from_status, to_status, 기본 message
#### UC-ERR-004: StorageError: operation
#### UC-ERR-005: TimerError: code
#### UC-ERR-006: ReferenceIntegrityError: entity, entity_id
#### UC-ERR-007: TimeTrackerError cause 체인
