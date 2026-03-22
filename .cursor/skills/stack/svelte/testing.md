# Svelte 스택 — 테스트 컨벤션

Svelte(및 Svelte 5 Runes) 기반 UI·스토어 테스트 시 QA 에이전트가 추가로 적용하는 규칙입니다.  
기존 `qa/references/`는 유지하며, 본 파일은 **진입점(요약)** 역할을 합니다.

## 상세 레퍼런스 (경로 고정)

- [Svelte 5 컴포넌트 테스트](../../qa/references/svelte-testing.md) — `@testing-library/svelte`, Vitest 설정, Runes 테스트 패턴

## Vitest · Testing Library (요약)

- **플러그인**: `svelteTesting()` from `@testing-library/svelte/vite` + `@sveltejs/vite-plugin-svelte` — 번들 리졸브·cleanup 자동화
- **환경**: `jsdom`, `setupFiles`로 전역 설정
- **확장자**: 테스트 코드에서 Runes(`$state` 등)를 **직접** 쓰려면 **`.svelte.test.ts`**; 컴포넌트 렌더만이면 `.test.ts`로도 가능
- **이벤트**: `@testing-library/user-event` + `userEvent.setup()` 권장
- **쿼리**: Testing Library [쿼리 우선순위](https://testing-library.com/docs/queries/about#priority) (`getByRole` 등)

상세 설정·코드 예시: [svelte-testing.md](../../qa/references/svelte-testing.md)

## 코드 리뷰: Compound Component

해당 UI 라이브러리가 Compound 패턴을 쓰는 경우:

- [ ] 사용처가 `<Component>` 단일 태그 대신 `<Component.Root>` 등으로 모두 갱신되었는지
- [ ] Part 컴포넌트(Trigger, Content, Item 등)가 `...rest`로 `aria-label` 등 HTML 속성을 전달하는지

## 모듈 레벨 상태·Storybook

- 모듈 레벨 `$state` 또는 동일한 전역 격리가 필요한 스토어를 쓰는 컴포넌트는 Storybook에서 **StoryWrapper `onMount` 시 reset** 여부를 확인합니다. (상세: [Storybook 스택 testing](../storybook/testing.md))

## async 스토어·저장소 전환

스토어·저장소가 **동기 → async**로 전환될 때 테스트에 아래 **4가지**를 반드시 다룹니다.

1. **마이그레이션 분기**: persist + 메모리 스토어 + 파생 UI가 함께 갱신되는지 검증
2. **모듈 전역 격리**: 모듈 스코프 `$state` 등 → `resetForTests()`(또는 동등) export 후 `beforeEach`에서 호출
3. **async 타이밍**: 준비 전(로딩/기본값) vs `waitFor` 이후 실제 값 반영
4. **첫 사용 시나리오**: 플래그·스토리지 `undefined` 등 초기 상태를 명시적으로 재현

**테스트 환경 패치 금지**: `Object.prototype` / `Array.prototype` 오염, `process.on('uncaughtException')` 등 에러 억제, 패치만 적용하고 전체 스위트 미실행 — 금지.

- 범용 패턴·코드 예: [async-store-testing.md](../../qa/references/async-store-testing.md)
- 저장소 설계와의 정합: [chrome-extension-storage.md](../../developer/references/chrome-extension-storage.md) (확장 프로그램 시)
- 프로젝트 구현 예: [ecount-dev-tool.md](../../project-knowledge/references/ecount-dev-tool.md)
