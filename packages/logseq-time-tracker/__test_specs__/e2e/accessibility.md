# E2E 접근성 테스트 스펙

> **패키지**: `@personal/logseq-time-tracker`
> **테스트 레벨**: e2e
> **ID 체계**: `UC-{영역}-{번호}` (3자리 zero-padded)
> **형식**: BDD (Given-When-Then)

---

#### UC-A11Y-005: 색상 대비 WCAG 2.1 AA

- **Given**: 앱의 모든 텍스트 요소가 렌더링되어 있다
- **When**: 색상 대비를 측정한다
- **Then**: 모든 텍스트가 배경 대비 4.5:1 이상이다
- **Phase**: 3
- **테스트 레벨**: E2E
