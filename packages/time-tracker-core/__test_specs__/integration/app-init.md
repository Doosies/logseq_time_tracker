# App 초기화 통합 테스트 스펙

> **패키지**: `@personal/time-tracker-core`
> **테스트 레벨**: integration
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

### App 마운트 및 스토어 초기화

#### UC-PLUGIN-006: App 마운트 및 스토어 초기화

- **Given**: Logseq 환경이 모킹되어 있다
- **When**: main.ts → logseq.ready → App.svelte 마운트가 실행된다
- **Then**: App이 정상 렌더링되고, TimerStore/JobStore가 초기 상태로 설정된다
- **Phase**: 1
- **테스트 레벨**: 통합
