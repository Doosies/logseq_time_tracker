---
name: stack-svelte
description: Svelte 5(uikit 등) 컨벤션·테스트·워크플로우 진입점. 상세는 developer/qa references 링크.
---

# Svelte 스택 스킬 (진입점)

Svelte 5 Runes·Vanilla Extract·Storybook을 쓰는 패키지 작업 시 이 디렉터리를 먼저 엽니다. **요약은 아래 파일**, **전체 규칙·예시는 링크된 references**를 따릅니다.

## 파일 목록

| 파일 | 용도 |
|------|------|
| [conventions.md](./conventions.md) | TS 설정, 네이밍, Runes, 헤드리스/Compound, 토큰, 라이브러리 연동 요약 |
| [testing.md](./testing.md) | Vitest·Testing Library, async 스토어·Storybook 연계 QA 요약 |
| [workflows.md](./workflows.md) | 새 컴포넌트 추가 등 도메인 워크플로우 진입 |

## 상세 레퍼런스 (삭제하지 않음)

- [svelte-conventions.md](../../developer/references/svelte-conventions.md)
- [headless-components.md](../../developer/references/headless-components.md)
- [svelte-testing.md](../../qa/references/svelte-testing.md)
- [async-store-testing.md](../../qa/references/async-store-testing.md)

## 사용 시점

- Developer: Svelte 컴포넌트·스토어·스타일 구현 또는 리팩토링
- QA: Svelte 단위/통합 테스트, Storybook·스토어 격리 검증
- Planner: uikit 계열 구조·네이밍 결정 시

## 관련 스택

- [Storybook](../storybook/SKILL.md) — 스토리 격리·play 함수
- [pnpm 모노레포](../pnpm-monorepo/SKILL.md) — type-check·lint·format 스크립트
