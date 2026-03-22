---
name: qa
description: '단위·통합·E2E 테스트 및 품질 보증 스킬. 코드 리뷰, 커버리지·회귀 검증, 스택별 세부 규칙은 skills/stack/*/testing.md 및 qa/references를 함께 참조합니다.'
---

# QA 스킬

테스트와 품질 보증을 위한 전문 스킬입니다.

## 사용 시점

- 단위/통합/E2E 테스트를 작성할 때
- 코드 리뷰를 수행할 때
- 커버리지를 측정할 때(목표 80%+)
- 스토리·시각 회귀 도구(예: Storybook)로 검증할 때
- 성능 회귀 여부를 확인할 때
- UI 프레임워크별 테스트가 필요할 때 (`skills/stack/` 참조)

## 품질 게이트

- 테스트 통과율: 100%
- 커버리지 목표: 80%+
- 성능 회귀 허용 범위: 10% 이내
- 보안 취약점: 0
- Storybook 등 스토리 도구를 쓰는 프로젝트: [storybook/testing.md](../stack/storybook/testing.md) 기준 준수
- E2E 실행은 사용자 명시 요청 시에만 수행
- E2E 코드 품질은 단위/통합 테스트와 동일 기준 적용

## 상세 레퍼런스

필요 시 아래 레퍼런스를 참조합니다.

- [테스트 전략 및 방법론](references/test-strategy.md)
- 스택별 진입: [Svelte](../stack/svelte/testing.md) · [Storybook](../stack/storybook/testing.md) · [Chrome Extension](../stack/chrome-extension/testing.md)
- [Svelte 컴포넌트 테스트](references/svelte-testing.md)
- [Storybook 테스트 전략](references/storybook-strategy.md)
- [코드 리뷰 체크리스트](references/code-review.md)
- [커버리지 측정 가이드](references/coverage-check.md)
- [테스트 품질 기준](references/test-quality.md)
- [Chrome Extension 테스트](references/chrome-extension-testing.md)
- [TDD 게이트 기반 Red-Green-Refactor 워크플로우](references/tdd-gate-workflow.md)
- [절대 금지사항](../developer/references/prohibited-practices.md)
