---
name: headless-components
description: Svelte 5 헤드리스 Compound Component 패턴 가이드
---

# 헤드리스 Compound Component 패턴

## 개요

헤드리스 컴포넌트(Headless Component)는 **동작과 접근성만 제공**하고, **시각적 스타일은 소비자가 결정**하는 컴포넌트입니다.

- **제공**: 키보드 네비게이션, ARIA, focus 관리, 동작 로직
- **미제공**: 색상, 그림자, 크기, 여백 등 시각적 스타일
- **목적**: 소비자가 디자인 시스템에 맞게 자유롭게 스타일을 주입

## Compound Component 패턴

여러 하위 컴포넌트가 부모 컨텍스트를 공유하며 하나의 기능을 구성하는 패턴입니다.

### Root / Part 구조

- `Component.Root`: 상태 관리 및 컨텍스트 제공
- `Component.Part`: 개별 UI 요소 (Trigger, Content, Item 등)

```typescript
// 사용 예시
<Select.Root value={value} onchange={handleChange}>
  <Select.Trigger>선택해주세요</Select.Trigger>
  <Select.Content>
    <Select.Item value="a">옵션 A</Select.Item>
    <Select.Item value="b">옵션 B</Select.Item>
  </Select.Content>
</Select.Root>
```

### Barrel Export

각 Part를 명명된 export로 제공합니다.

```typescript
// Select/index.ts
export { default as Root } from './Root.svelte';
export { default as Trigger } from './Trigger.svelte';
export { default as Content } from './Content.svelte';
export { default as Item } from './Item.svelte';
```

### Namespace Import 패턴

소비자는 namespace import로 사용합니다.

```svelte
<script lang="ts">
  import * as Select from '@uikit/Select';
  // 또는
  import { Root as SelectRoot, Trigger, Content, Item } from '@uikit/Select';
</script>

<Select.Root ...>
  <Select.Trigger ... />
  <Select.Content ... />
</Select.Root>
```

### 디렉토리 구조

```
ComponentName/
├── Root.svelte      # 컨텍스트 제공, 상태 관리
├── Trigger.svelte   # Part
├── Content.svelte   # Part
├── Item.svelte      # Part
└── index.ts         # barrel export
```

## Svelte 5 구현 방법

### children: Snippet 기본 슬롯 패턴

`Snippet`으로 자식 콘텐츠를 받습니다.

```svelte
<!-- Root.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    value?: string;
    onchange?: (value: string) => void;
    children: Snippet;
  }

  let { value, onchange, children }: Props = $props();
</script>

<div data-select-root ...>
  {@render children()}
</div>
```

### setContext / getContext로 부모-자식 상태 공유

부모에서 상태를 제공하고, Part들이 컨텍스트로 읽습니다.

```svelte
<!-- Root.svelte -->
<script lang="ts">
  import { setContext } from 'svelte';

  const SELECT_KEY = Symbol('select');

  // ... props, $state ...

  setContext(SELECT_KEY, {
    value: $derived(value),
    isOpen: $derived(isOpen),
    selectValue: (v: string) => { ... },
  });
</script>
```

```svelte
<!-- Item.svelte -->
<script lang="ts">
  import { getContext } from 'svelte';

  const select_api = getContext(SELECT_KEY);
  // select_api.value, select_api.selectValue 등 사용
</script>
```

Svelte 5.4+에서는 `createContext` API를 사용할 수 있습니다.

### Props Spreading (HTML 속성 전달)

`...restProps`로 HTML 속성을 그대로 전달합니다.

```svelte
<script lang="ts">
  interface Props extends svelteHTML.HTMLAttributes<HTMLButtonElement> {
    children: Snippet;
  }

  let { children, ...restProps }: Props = $props();
</script>

<button {...restProps} data-trigger>
  {@render children()}
</button>
```

### class Prop으로 스타일 주입

소비자가 시각적 스타일을 `class`로 주입합니다.

```svelte
<script lang="ts">
  interface Props {
    class?: string;
    children: Snippet;
  }

  let { class: extra_class = '', children }: Props = $props();
</script>

<button class={extra_class} data-trigger>
  {@render children()}
</button>
```

## 스타일 기준

### 포함해야 할 스타일 (동작·접근성)

| 유형 | 예시 |
|------|------|
| 접근성 | `:focus-visible` outline |
| 동작 | `cursor: grab`, `cursor: pointer` |
| Reset | `outline: none`, `user-select: none` (드래그 등) |
| 필수 레이아웃 | `display: flex` (내부 구조용) |

```css
/* ✅ 헤드리스에 포함 가능 */
.trigger {
  outline: none;
  cursor: pointer;
  user-select: none; /* 드래그 핸들 등 */
}
.trigger:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
```

### 포함하지 말아야 할 스타일 (시각적)

| 유형 | 예시 |
|------|------|
| 색상 | `color`, `background`, `border-color` |
| 그림자 | `box-shadow` |
| 크기 | `width`, `height`, `min-width` |
| 여백 | `margin`, `padding` |
| border 스타일 | `border-radius`, `border-width` |
| 폰트 | `font-size`, `font-weight` |
| 애니메이션 | `transition`, `animation` (시각적) |

### 소비자 스타일 주입

소비자가 `class` prop으로 시각적 스타일을 주입합니다.

```svelte
<!-- 소비자 코드 -->
<Select.Trigger class="rounded-lg bg-primary px-4 py-2 text-white shadow-sm">
  선택해주세요
</Select.Trigger>
```

## 좋은 예 / 나쁜 예

### 스타일 범위

```svelte
<!-- ✅ 좋은 예: 동작·접근성만 -->
<button
  class={extra_class}
  role="button"
  tabindex="-1"
  aria-label={label}
  style="cursor: grab; outline: none; user-select: none;"
>
  {@render children()}
</button>

<!-- ❌ 나쁜 예: 시각적 스타일 포함 -->
<button
  class="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium shadow"
  ...
>
```

### Props 전달

```svelte
<!-- ✅ 좋은 예: restProps 전달 -->
<script lang="ts">
  let { children, class: c, ...rest }: Props = $props();
</script>
<button {...rest} class={c}>{@render children()}</button>

<!-- ❌ 나쁜 예: HTML 속성 무시 -->
<script lang="ts">
  let { children } = $props();  // onclick, disabled 등 누락
</script>
<button>{@render children()}</button>
```

### 컨텍스트 사용

```svelte
<!-- ✅ 좋은 예: Part가 컨텍스트로 상태 접근 -->
<script lang="ts">
  const api = getContext(SELECT_KEY);
  const isSelected = $derived(api.value === value);
</script>

<!-- ❌ 나쁜 예: props drilling -->
<Select.Item value="a" rootValue={value} onSelect={onchange} />
```

### Compound 구조

```typescript
// ✅ 좋은 예: Root + Part 명확 분리
export { default as Root } from './Root.svelte';
export { default as Trigger } from './Trigger.svelte';
export { default as Item } from './Item.svelte';

// ❌ 나쁜 예: 단일 컴포넌트에 모든 것 집약
export { default as Select } from './Select.svelte';
// <Select items={...} renderItem={...} /> 처럼 복잡한 API
```

## 참고 라이브러리

- **[Bits UI](https://bits-ui.com/)**: Svelte 헤드리스 UI 프리미티브
- **[shadcn-svelte](https://www.shadcn-svelte.com/)**: Bits UI 기반, 복사 가능 컴포넌트
- **[Radix Vue](https://www.radix-vue.com/)**: Vue 버전, 같은 패턴 참고 가능

## 체크리스트

헤드리스 컴포넌트 작성 시 확인할 항목:

- [ ] `Component.Root` + `Component.Part` 구조 사용
- [ ] `children: Snippet` (또는 `row: Snippet<[T]>`) 패턴 적용
- [ ] `setContext`/`getContext`로 부모-자식 상태 공유
- [ ] `...restProps`로 HTML 속성 전달
- [ ] `class` prop으로 시각적 스타일 주입 허용
- [ ] 포함 스타일: `cursor`, `outline`, `user-select`, `:focus-visible` 등만
- [ ] 미포함 스타일: 색상, 그림자, 크기, 여백, border-radius 등 제외
- [ ] Barrel export: `export { default as Part } from './Part.svelte'`
- [ ] 디렉토리 구조: `ComponentName/Part.svelte` + `index.ts`
- [ ] Props 인터페이스: `XxxProps`, camelCase (svelte-conventions 준수)
