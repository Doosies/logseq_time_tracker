# E2E 작업 전환 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: e2e
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 6.2 작업 전환

#### UC-E2E-002: Job A → Job B 전환 및 자동 일시정지

- **Given**: Job A가 in_progress 상태이다
- **When**: Job B의 "시작" 버튼을 클릭하고 사유를 입력한다
- **Then**: Job A가 paused로 표시되고, Job B가 in_progress로 표시되며, History에 전환 기록이 존재한다
- **Phase**: 2
- **테스트 레벨**: E2E
