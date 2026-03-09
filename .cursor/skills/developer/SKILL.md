---
name: developer
description: "Svelte 5 / TypeScript 모노레포(pnpm workspace + Turbo) 구현·리팩토링 스킬. 기능 구현, 리팩토링, Svelte 5 Runes 컴포넌트 작성, 의존성/설정 최적화, MCP 서버 개발 시 사용합니다."
---

# 개발 스킬

코드 구현과 리팩토링을 위한 전문 스킬입니다.

## 사용 시점

- 설계 문서를 기반으로 새 기능을 구현할 때
- 코드 리팩토링 및 최적화가 필요할 때
- Svelte 5 컴포넌트를 작성할 때
- MCP 서버를 개발할 때
- 의존성/설정 파일을 관리할 때

## 빠른 기준

### 네이밍 규칙
- 변수: `snake_case`
- 함수: `camelCase`
- 클래스: `PascalCase`
- 상수: `UPPER_SNAKE_CASE`

### 핵심 원칙
- Linter 오류 0개 유지 (필수)
- 에러 처리 포함
- 테스트 가능한 구조(의존성 분리)
- 추측 금지, 실제 코드 확인

## 상세 레퍼런스

필요 시 아래 레퍼런스를 참조합니다.

- [구현 체크리스트 및 가이드](references/code-implementation.md)
- [리팩토링 패턴](references/refactoring-patterns.md)
- [Svelte 5 Runes 컨벤션](references/svelte-conventions.md)
- [테스트 가능한 코드 패턴](references/testable-code.md)
- [자동 포매팅 규칙](references/auto-formatting.md)
- [의존성 감사 및 카탈로그 관리](references/dependency-management.md)
- [tsconfig/eslint/vite 최적화](references/config-optimization.md)
- [pnpm workspace + turbo 운영 패턴](references/monorepo-patterns.md)
- [Headless 컴포넌트 패턴](references/headless-components.md)
- [MCP 서버 개발 가이드 디렉토리](references/mcp/)
- [Chrome Extension 라우팅 패턴](references/chrome-extension-routing.md)
