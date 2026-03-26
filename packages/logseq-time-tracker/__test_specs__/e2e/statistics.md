# E2E 통계 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: e2e
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 6.4 통계

#### UC-E2E-004: 기간별 통계 표시

- **Given**: 지난 7일간 여러 TimeEntry가 존재한다
- **When**: 풀화면에서 "이번 주" 기간을 선택한다
- **Then**: 작업별/카테고리별 누적 시간이 표시된다
- **Phase**: 4
- **테스트 레벨**: E2E
