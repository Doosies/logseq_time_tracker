---
name: stack-storybook
description: Storybook 컨벤션·테스트 전략 진입점. Svelte CSF3·play 함수 상세는 qa references 링크.
---

# Storybook 스택 스킬 (진입점)

시각·인터랙션 스토리와 test runner를 쓰는 패키지에서 QA·Developer가 공통으로 참조합니다.

## 파일 목록

| 파일 | 용도 |
|------|------|
| [conventions.md](./conventions.md) | 모듈 스토어·스토리 간 격리(reset) |
| [testing.md](./testing.md) | CSF3·play·품질 게이트 요약 |

## 상세 레퍼런스 (삭제하지 않음)

- [storybook-strategy.md](../../qa/references/storybook-strategy.md)

## 사용 시점

- 새 `.svelte` 컴포넌트 추가 시 스토리 존재 여부(Feature 게이트)
- StoryWrapper·`onMount` reset 패턴 (Svelte 모듈 스토어)
- play function·assertion 요구사항

## 관련 스택

- [Svelte](../svelte/SKILL.md) — 컴포넌트 내부 규칙·모듈 스토어
- [config-optimization.md](../../developer/references/config-optimization.md) — addon·버전 정합
