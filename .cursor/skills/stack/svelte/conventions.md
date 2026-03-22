# Svelte 스택 컨벤션

Svelte 패키지(uikit, ecount-dev-tool 등) 작업 시 적용합니다.

> **상세·예시·체크리스트**는 [Svelte 컨벤션](../../developer/references/svelte-conventions.md) 참조 (본 문서는 진입용 요약)

## TypeScript 설정

- `verbatimModuleSyntax: false` 필수 (Svelte와 호환 안됨)
- `jsx: "preserve"` 설정 (Svelte 컴파일러가 처리)
- ESLint: `eslint-plugin-svelte` 사용

## Svelte 5 Runes 모드

`$state`, `$derived`, `$effect` 사용

## 네이밍 핵심 원칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일·폴더 | `PascalCase` | `Button/Button.svelte`, `Button/index.ts` |
| 스타일 (Vanilla Extract) | `snake_case.css.ts` | `toggle_input.css.ts` |
| Runes 스토어 모듈 | `snake_case.svelte.ts` (프로젝트 관례 시) | `current_tab.svelte.ts` |
| 서비스·타입 (일반 `.ts`) | 파일명 `snake_case.ts`, 변수 `snake_case` / 함수 `camelCase` | AGENTS.md와 동일 |

- 컴포넌트 파일: `PascalCase.svelte` (폴더도 `PascalCase/`)
- 스타일 파일: `snake_case.css.ts`
- 스토어/서비스 파일: `snake_case.ts`

> ⚠️ **컴포넌트 내부 예외**: Svelte 컴포넌트 `.svelte` 파일 내부는 `camelCase` 사용
> (props, 로컬 변수, $state/$derived 변수 모두 camelCase - TypeScript/Svelte 생태계 표준)
> 일반 .ts 파일의 `snake_case` 규칙과 다름

> **컴포넌트 내부 예외(요약)**: `.svelte` 파일 내부 변수/props는 `camelCase` 사용. 상세는 [Svelte 컨벤션](../../developer/references/svelte-conventions.md) 참조.

## 모듈 레벨 상태 스토어 (Svelte 5 $state)

Svelte 5의 모듈 레벨 `$state()` 또는 `let _is_initialized` 패턴을 사용하는 스토어는:

1. **reset 함수 필수 제공**: `export function resetXxx(): void` 형태로 초기화/리셋 함수 노출
2. **Storybook 호환**: 해당 스토어를 사용하는 컴포넌트의 StoryWrapper에서 **onMount 시점에 reset() 호출**하여 스토리 간 격리 보장
3. **이유**: Storybook test runner는 스토리를 순차 실행할 때 동일 모듈 인스턴스를 재사용. reset 없으면 이전 스토리 상태가 유지됨

Storybook 전용 체크는 [Storybook 컨벤션](../storybook/conventions.md)과 함께 참조합니다.

## 코드 이관 시 Svelte 스토어 테스트

새 스토어/서비스 모듈 생성 시:

- Svelte 스토어($state, store 패턴): subscribe, get, set, reset 등 모든 동작 테스트

## Vanilla Extract / theme_vars (의미적 토큰)

테마 토큰(theme_vars.color.\* 등)을 사용할 때 **의미적 용도(semantic purpose)**를 고려합니다:

1. **토큰의 의도된 용도 확인**
    - `color.background`: 페이지/컨테이너 배경 (라이트: 밝은색, 다크: 어두운색)
    - `color.text`: 본문 텍스트 (배경과 대비되는 색)
    - `color.primary`: 강조/CTA 요소
    - 단순 "해당 색이 하드코딩과 같다"만으로 교체하지 말 것

2. **맥락에 맞는 토큰 선택**
    - 버튼 텍스트: `color.background` 위에선 `color.text` 또는 `color.primary` 사용. `color.background`는 사용 금지 (다크 모드에서 가독성 저하)
    - 카드 배경: `color.background` 사용 가능

3. **거부 판단이 맞는 경우**
    - `#ffffff` 등을 `color.background`로 교체 시, 다크 테마에서 가독성 저하되면 교체하지 않음
    - 대안: `color.text`, 별도 토큰 추가, 또는 기존 하드코딩 유지

## 외부 라이브러리 + Svelte / @dnd-kit

반응형 프레임워크에서 라이브러리 사용 시 **공식 문서의 Usage 섹션**을 확인합니다.

- `.d.ts`에는 시그니처만 있고, **올바른 사용 패턴**(예: getter 함수 vs `$derived.by`)은 문서에만 있을 수 있음
- 예: `@dnd-kit/svelte` → getter 함수 패턴(`get id() { return id; }`) 권장, `$derived.by(() => createSortable(...))`는 인스턴스 매번 재생성되어 부적절
- 사용할 API의 `.d.ts` 경로 확인 (예: `node_modules/@dnd-kit/svelte/dist/index.d.ts`)

타입 검증·lint·format 스크립트는 [pnpm 모노레포 컨벤션](../pnpm-monorepo/conventions.md) 및 프로젝트 `.cursor-agent-config.yaml`을 참조합니다.

## Svelte 5 동적 컴포넌트·{@const}·DOM ref (요약)

- **동적 컴포넌트**: Runes 모드에서는 `<svelte:component>` 대신 **dot notation** (`<section.component />`) 사용
- **`{@const}`**: `#each` / `#if` / `#snippet` 등의 **직접 자식**에만 배치 (중첩 `<div>` 안이면 컴파일 오류)
- **`bind:this`**: 대상 변수는 `$state` + `ElementType | undefined` 초기값 `undefined` 패턴으로 선언 (일반 `let`은 non-reactive 경고)

전체 코드 예시·체크리스트: [svelte-conventions.md](../../developer/references/svelte-conventions.md)

## 헤드리스 · Compound Component (Svelte)

UI 라이브러리에서 **동작·접근성만 제공**하고 스타일은 소비자가 주입하는 패턴입니다.

- **구조**: `Component.Root` + `Component.Part`(Trigger, Content, Item …), barrel export, namespace import
- **구현**: `children: Snippet`, `setContext`/`getContext`, Part는 **`...rest`로 HTML 속성 전달** (`aria-*`, `disabled` 등)
- **스타일**: 헤드리스 쪽은 cursor·focus-visible·필요 레이아웃만; 색·여백·radius 등은 소비자 `class`
- **마이그레이션**: 사용처를 `<Card>` → `<Card.Root>` 등으로 일괄 검색·갱신

전체 패턴·체크리스트: [headless-components.md](../../developer/references/headless-components.md)
