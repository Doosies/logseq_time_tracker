# Statistics 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.11 StatisticsService

#### UC-STAT-001: Job별 누적 시간 조회

- **Given**: Job A에 3건의 TimeEntry가 있다 (합계 7200초)
- **When**: getJobDuration(job_a_id)을 호출한다
- **Then**: total_seconds가 7200이고, entry_count가 3인 DurationSummary가 반환된다
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-STAT-002: Category별 누적 시간 조회

- **Given**: Category "개발"에 속한 TimeEntry가 5건 있다 (합계 18000초)
- **When**: getCategoryDuration(category_dev_id)을 호출한다
- **Then**: total_seconds가 18000이고, entry_count가 5인 DurationSummary가 반환된다
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-STAT-003: Job 내 카테고리 분포 조회

- **Given**: Job A에 "개발" 3600초, "분석" 1800초의 TimeEntry가 있다
- **When**: getJobCategoryBreakdown(job_a_id)을 호출한다
- **Then**: 2개의 CategoryBreakdown이 반환되고, "개발" percentage가 약 66.7%, "분석"이 약 33.3%이다
- **Phase**: 5
- **테스트 레벨**: 단위

#### UC-STAT-004: 일별 요약 조회

- **Given**: 2026-03-10 ~ 2026-03-12에 각각 TimeEntry가 존재한다
- **When**: getDailySummary({ from: '2026-03-10', to: '2026-03-12' })를 호출한다
- **Then**: 3일치의 DailySummary가 반환되고, 각 날짜별 total_seconds와 entries가 포함된다
- **Phase**: 5
- **테스트 레벨**: 단위
