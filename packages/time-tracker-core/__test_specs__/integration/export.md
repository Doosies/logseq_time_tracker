# 데이터보내기 (통합) 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: integration
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 11.3 Export 에러 케이스


#### UC-EXPORT-002: 대량 데이터 내보내기 시 타임아웃

- **Given**: 10,000건 이상의 TimeEntry가 존재한다
- **When**: `DataExportService.exportCSV(period)` 호출
- **Then**: 30초 이내에 완료되거나, 타임아웃 시 `StorageError`와 토스트 표시
- **Phase**: 5
- **테스트 레벨**: 통합
