# DataField 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.9 DataFieldService (Phase 3)

#### UC-DFIELD-001: 커스텀 필드 생성

- **Given**: EntityType "job"이 존재한다
- **When**: DataFieldService.createField({ entity_type_id, key: "priority", data_type: "enum", options: ["high", "medium", "low"] })를 호출한다
- **Then**: DataField 레코드가 생성되고, is_system: false이다
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-DFIELD-002: 시스템 필드 삭제 거부

- **Given**: is_system: true인 DataField "title"이 존재한다
- **When**: DataFieldService.deleteField(title_field_id)를 호출한다
- **Then**: ValidationError가 발생한다 (시스템 필드는 삭제 불가)
- **Phase**: 3
- **테스트 레벨**: 단위

#### UC-DFIELD-003: (entity_type_id, key) 유일성 검증

- **Given**: EntityType "job"에 key "priority" DataField가 이미 존재한다
- **When**: 동일 entity_type_id와 key "priority"로 새 DataField를 생성하려 한다
- **Then**: ValidationError가 발생한다 (동일 엔티티 내 key 중복 불가)
- **Phase**: 3
- **테스트 레벨**: 단위
