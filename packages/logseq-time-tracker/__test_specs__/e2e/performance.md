# E2E 성능 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: e2e
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

#### UC-PERF-001: 타이머 시작 응답 시간

- **Given**: 앱이 정상 로드된 상태이다
- **When**: 타이머 시작 버튼을 클릭한다
- **Then**: UI가 200ms 이내에 반응한다 (`performance.measure` 기준)
- **Phase**: 2
- **테스트 레벨**: E2E

#### UC-PERF-002: Job 전환 응답 시간

- **Given**: Job A가 in_progress 상태이다
- **When**: Job B로 전환한다 (reason 포함)
- **Then**: 전환 완료 (UI 갱신 포함)가 200ms 이내이다
- **Phase**: 2
- **테스트 레벨**: E2E
