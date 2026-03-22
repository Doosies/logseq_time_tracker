---
name: stack-chrome-extension
description: Chrome Extension(MV3) 컨벤션·테스트 진입점. 라우팅·스토리지·API 모킹은 developer/qa references 링크.
---

# Chrome Extension 스택 스킬 (진입점)

확장 프로그램(팝업·백그라운드·별도 HTML·content script) 작업 시 이 디렉터리를 먼저 엽니다.

## 파일 목록

| 파일 | 용도 |
|------|------|
| [conventions.md](./conventions.md) | 스토리지 삼중 일치, 라우팅·빌드 진입 요약 |
| [testing.md](./testing.md) | Vitest에서 `chrome.*` 모킹 등 QA 요약 |

## 상세 레퍼런스 (삭제하지 않음)

- [chrome-extension-routing.md](../../developer/references/chrome-extension-routing.md)
- [chrome-extension-storage.md](../../developer/references/chrome-extension-storage.md)
- [chrome-extension-testing.md](../../qa/references/chrome-extension-testing.md)

## 사용 시점

- Developer: `manifest`, Vite web-extension 플러그인, `chrome.tabs`/`storage` 연동
- QA: 확장 API 모킹·통합 테스트

## 관련

- [pnpm 모노레포](../pnpm-monorepo/SKILL.md)
- [async-store-testing](../../qa/references/async-store-testing.md) — 스토리지 async 전환 시
