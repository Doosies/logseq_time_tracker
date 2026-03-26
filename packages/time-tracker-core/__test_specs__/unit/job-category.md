# JobCategory 서비스 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: unit
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 2.8 JobCategoryService (Phase 2)

#### UC-JCAT-001: Job-Category 연결 생성

- **Given**: Job A와 Category "개발"이 존재한다
- **When**: JobCategoryService.link(job_a_id, category_dev_id)를 호출한다
- **Then**: JobCategory 레코드가 생성되고, is_default는 false이다
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JCAT-002: is_default 유일성 보장

- **Given**: Job A에 Category "개발"(is_default: true)이 연결되어 있다
- **When**: Category "분석"을 is_default: true로 연결한다
- **Then**: "분석"이 is_default: true가 되고, "개발"의 is_default가 false로 변경된다 (동일 Job 내 is_default는 1개만)
- **Phase**: 2
- **테스트 레벨**: 단위

#### UC-JCAT-003: 존재하지 않는 Job/Category 연결 거부

- **Given**: 존재하지 않는 job_id 또는 category_id
- **When**: link(invalid_job_id, category_id)를 호출한다
- **Then**: ValidationError가 발생한다
- **Phase**: 2
- **테스트 레벨**: 단위
