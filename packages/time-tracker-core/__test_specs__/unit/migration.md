# 스키마 마이그레이션 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.12 스키마 마이그레이션 (Phase 2)

#### UC-MIGRATE-001: 마이그레이션 순차 실행

- **Given**: DB 스키마 버전이 1이고, 마이그레이션 2, 3이 정의되어 있다
- **When**: 앱이 초기화되어 마이그레이션을 실행한다
- **Then**: 마이그레이션 2 → 3이 순서대로 실행되고, 스키마 버전이 3으로 갱신된다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-MIGRATE-002: Export 버전 마이그레이션

- **Given**: ExportData 버전 1 형식의 JSON이 있다 (현재 앱은 버전 2)
- **When**: importData(v1_json)을 호출한다
- **Then**: migrateExportData() 체인이 v1 → v2로 변환한 뒤 정상 임포트된다
- **Phase**: 2
- **테스트 레벨**: 단위
