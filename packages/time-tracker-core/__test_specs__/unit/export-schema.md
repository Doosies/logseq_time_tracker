# Export 스키마 검증 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-SCHEMA-{번호}` (3자리 zero-padded)

---

#### UC-SCHEMA-001: 유효한 ExportData면 검증 통과
#### UC-SCHEMA-002: version 누락 시 ValidationError
#### UC-SCHEMA-003: data.jobs가 배열이 아니면 ValidationError
#### UC-SCHEMA-004: job.status가 잘못된 값이면 ValidationError
#### UC-SCHEMA-005: data.categories 내 is_active가 boolean이 아니면 ValidationError
#### UC-SCHEMA-006: 빈 data(모든 배열 [])면 검증 통과
#### UC-SCHEMA-007: data_fields 키가 없으면 기본값 []로 검증 통과
#### UC-SCHEMA-008: 에러 메시지에 경로 정보가 포함된다
