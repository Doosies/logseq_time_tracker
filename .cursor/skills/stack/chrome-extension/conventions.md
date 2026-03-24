# Chrome Extension 스택 컨벤션

Manifest V3·Vite 기반 확장(팝업, service worker, 별도 HTML 페이지) 작업 시 적용합니다.

> **상세·코드 예시**는 아래 링크를 따릅니다 (본 문서는 진입용 요약).

## 스토리지·스토어 마이그레이션

저장소 교체·async 전환 시 **저장소(persist)·메모리 스토어·UI 파생 상태**의 **삼중 일치**를 반드시 확인합니다.

- 동기 `localStorage` + 비동기 `chrome.storage` 병행 시 **2단계 초기화**(동기로 FOUC 방지 → onMount에서 sync 확정) 패턴을 고려합니다.
- onMount에서 async 초기화 시 **await 누락·초기화 순서**를 점검합니다.

**상세**: [chrome-extension-storage.md](../../developer/references/chrome-extension-storage.md)  
**프로젝트 예**: `project-knowledge/references/` 내 해당 확장 패키지 문서 참조

## 라우팅·다중 HTML 진입점 (요약)

- **별도 페이지**(예: `editor.html`): `vite-plugin-web-extension`의 **`additionalInputs`**에 HTML 등록, manifest·`web_accessible_resources` 정합
- **URL hash**: `chrome.runtime.getURL('...html#...')`로 열기; hash 파싱은 관대하게, ID·권한 검증은 페이지 쪽에서
- **`chrome.tabs`**: `create`는 popup/background 등 컨텍스트에 맞게; `getCurrent`는 extension 페이지에서만 유효 등 — API별 호출 위치 확인

**상세**: [chrome-extension-routing.md](../../developer/references/chrome-extension-routing.md)

## 빌드·alias

TypeScript `paths`와 Vite `resolve.alias`·패키지 `exports`를 맞춥니다. Vite/ESLint 전역(`chrome` 등)은 [config-optimization.md](../../developer/references/config-optimization.md)의 Chrome Extension·ESLint 절을 참조합니다.

## 테스트 진입

[testing.md](./testing.md) → [chrome-extension-testing.md](../../qa/references/chrome-extension-testing.md)
