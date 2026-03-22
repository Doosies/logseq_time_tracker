# Chrome Extension 스택 — 테스트

Chrome 확장(MV3)·service worker·content script 등을 다루는 프로젝트에서 QA가 따르는 **진입 요약**입니다.

## 상세 레퍼런스 (경로 고정)

- [Chrome Extension 테스트](../../qa/references/chrome-extension-testing.md)

## Vitest · 전역 모킹 (요약)

- **`setupFiles`**에서 `vi.stubGlobal('chrome', { runtime, tabs, scripting, … })` 형태로 최소 API 채움
- **`beforeEach`에서 `vi.clearAllMocks()`** 로 테스트 간 격리
- **`chrome.tabs.query` / `create` / `getCurrent` / `remove`** 등 시나리오별 `mockResolvedValue`로 행위 검증
- **라우팅·`getURL`**: 경로·hash가 기대와 일치하는지 단언

## 적용 범위

- `manifest`·빌드 산출물·권한 모델에 맞는 단위/통합 전략은 위 레퍼런스와 프로젝트 설정을 함께 따릅니다.
- 스토리지 async 전환·마이그레이션 테스트는 [async-store-testing.md](../../qa/references/async-store-testing.md)와 [chrome-extension-storage.md](../../developer/references/chrome-extension-storage.md)를 함께 참조합니다.
- 일반 품질 게이트(테스트 통과, 커버리지, 금지 패턴)는 [QA SKILL](../../qa/SKILL.md)을 따릅니다.

**전체 mock 예시·tabs/scripting/edge 케이스**: [chrome-extension-testing.md](../../qa/references/chrome-extension-testing.md)
