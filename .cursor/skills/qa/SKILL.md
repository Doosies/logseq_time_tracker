---
name: qa
description: "Vitest/Testing Library 기반 테스트 및 품질 보증 스킬. 단위/통합 테스트, Svelte 5 컴포넌트 테스트, Storybook play 함수 검증, 코드 리뷰, 커버리지 점검 시 사용합니다."
---

# QA 스킬

테스트와 품질 보증을 위한 전문 스킬입니다.

## 사용 시점

- 단위/통합/E2E 테스트를 작성할 때
- 코드 리뷰를 수행할 때
- 커버리지를 측정할 때(목표 80%+)
- Storybook 스토리를 검증할 때
- 성능 회귀 여부를 확인할 때
- Svelte 컴포넌트를 테스트할 때

## 품질 게이트

- 테스트 통과율: 100%
- 커버리지 목표: 80%+
- 성능 회귀 허용 범위: 10% 이내
- 보안 취약점: 0
- 모든 스토리에 play 함수 포함
- E2E 실행은 사용자 명시 요청 시에만 수행
- E2E 코드 품질은 단위/통합 테스트와 동일 기준 적용

## 상세 레퍼런스

필요 시 아래 레퍼런스를 참조합니다.

- [테스트 전략 및 방법론](references/test-strategy.md)
- [Svelte 컴포넌트 테스트](references/svelte-testing.md)
- [Storybook 테스트 전략](references/storybook-strategy.md)
- [코드 리뷰 체크리스트](references/code-review.md)
- [커버리지 측정 가이드](references/coverage-check.md)
- [테스트 품질 기준](references/test-quality.md)
- [Chrome Extension 테스트](references/chrome-extension-testing.md)
- [TDD 게이트 기반 Red-Green-Refactor 워크플로우](references/tdd-gate-workflow.md)
