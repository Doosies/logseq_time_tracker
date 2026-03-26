# E2E 타이머 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: e2e
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### 6.1 타이머 플로우

#### UC-E2E-001: 타이머 시작 → 경과 → 정지 → 기록 확인

- **Given**: Logseq 플러그인이 로드된 상태이다
- **When**: 시작 클릭 → 3초 대기 → 정지 클릭
- **Then**: 경과시간이 0초보다 크게 표시되었다가, 정지 후 TimeEntry가 저장된다
- **Phase**: 2
- **테스트 레벨**: E2E
