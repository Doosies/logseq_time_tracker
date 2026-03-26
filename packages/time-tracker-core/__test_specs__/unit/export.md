# 데이터보내기 (단위) 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 11.3 Export 에러 케이스

#### UC-EXPORT-001: 빈 기간에 대한 내보내기

- **Given**: 선택한 기간에 TimeEntry가 0건이다
- **When**: `DataExportService.exportCSV(period)` 호출
- **Then**: 헤더만 포함된 빈 CSV가 생성되고, 토스트로 "해당 기간에 기록이 없습니다." 안내
- **Phase**: 5
- **테스트 레벨**: 단위


#### UC-EXPORT-003: 내보내기 중 Storage 오류

- **Given**: Storage가 비정상 상태이다 (fallback 모드)
- **When**: 내보내기를 시도한다
- **Then**: MemoryAdapter의 현재 데이터로 내보내기가 수행되고, 배너에 "임시 모드 데이터입니다" 경고 포함
- **Phase**: 5
