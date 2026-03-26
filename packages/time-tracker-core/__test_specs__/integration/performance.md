# 성능 (컴포넌트·통합) 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: integration
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

## 10. 성능 테스트

NFR-4.1에 따른 성능 검증 유즈케이스입니다.

### 10.1 주요 액션 응답 시간

#### UC-PERF-003: 대량 Job 목록 렌더링

- **Given**: 100개의 Job이 존재한다
- **When**: JobList 컴포넌트를 렌더링한다
- **Then**: 초기 렌더링이 500ms 이내에 완료된다
- **Phase**: 3
- **테스트 레벨**: 컴포넌트

#### UC-PERF-004: SQLite 쿼리 성능 (대량 TimeEntry)

- **Given**: 10,000건의 TimeEntry가 존재한다
- **When**: 1개월 기간으로 필터 조회한다
- **Then**: 쿼리 결과가 500ms 이내에 반환된다
- **Phase**: 3
- **테스트 레벨**: 통합
