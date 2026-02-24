---
name: storybook-strategy
description: Svelte Storybook Story 작성 - @storybook/addon-svelte-csf v5 기반 Svelte CSF Story 패턴
---

# Svelte Storybook Story 작성 가이드

이 Skill은 QA 에이전트가 Svelte 5 컴포넌트의 Storybook Story를 작성하는 패턴을 제공합니다.

## Story 파일 형식

### Svelte CSF (.stories.svelte) - 권장

`@storybook/addon-svelte-csf` v5를 사용하여 Svelte 네이티브 문법으로 Story를 작성합니다.

```svelte
<!-- Button.stories.svelte -->
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Button from './Button.svelte';

  const { Story } = defineMeta({
    component: Button,
    title: 'uikit/Button',
  });
</script>

<Story name="Primary" args={{ variant: 'primary' }}>
  Click me
</Story>
```

### CSF 3 (.stories.ts) - 대안

Svelte CSF가 불가능한 경우에만 사용합니다.

```typescript
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Button from './Button.svelte';

const meta = {
  component: Button,
  title: 'uikit/Button',
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: 'primary' },
};
```

---

## defineMeta API

`<script module>` 블록에서 defineMeta를 호출하여 메타데이터를 정의합니다.

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MyComponent from './MyComponent.svelte';

  const { Story } = defineMeta({
    component: MyComponent,
    title: 'PackageName/ComponentName',
    tags: ['autodocs'],
    args: {
      variant: 'primary',
      disabled: false,
    },
    argTypes: {
      variant: {
        control: 'select',
        options: ['primary', 'secondary', 'accent'],
        description: '버튼 스타일 변형',
      },
      size: {
        control: 'radio',
        options: ['sm', 'md'],
      },
      disabled: {
        control: 'boolean',
      },
      onclick: {
        action: 'clicked',
      },
    },
  });
</script>
```

### 주요 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `component` | 대상 컴포넌트 | `Button` |
| `title` | Storybook 사이드바 경로 | `'uikit/Button'` |
| `tags` | 태그 (`'autodocs'` 등) | `['autodocs']` |
| `args` | 기본 props 값 | `{ variant: 'primary' }` |
| `argTypes` | Controls 패널 설정 | `{ variant: { control: 'select' } }` |
| `decorators` | 래퍼 데코레이터 | `[...]` |

---

## Story 작성 패턴

### 기본 Story

```svelte
<Story name="Default" />
```

### args로 props 전달

```svelte
<Story name="Primary" args={{ variant: 'primary', size: 'md' }} />
```

### children(Snippet) 전달

Story 태그 내부에 직접 마크업을 작성합니다.

```svelte
<Story name="WithText" args={{ variant: 'primary' }}>
  Click me
</Story>

<Story name="WithIcon" args={{ variant: 'secondary' }}>
  <span>🔍</span> Search
</Story>
```

### 복합 컴포넌트 조합

```svelte
<Story name="WithComponents">
  <OuterComponent>
    <MyComponent />
  </OuterComponent>
</Story>
```

### 인터랙티브 Story (로컬 상태 사용)

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ToggleInput from './ToggleInput.svelte';

  const { Story } = defineMeta({
    component: ToggleInput,
    title: 'uikit/ToggleInput',
  });
</script>

<script>
  let is_text_mode = $state(false);

  function handleToggle() {
    is_text_mode = !is_text_mode;
  }
</script>

<Story name="Interactive" args={{
  isTextMode: is_text_mode,
  onToggle: handleToggle,
  options: [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ],
}} />
```

---

## argTypes Control 타입

| Control | 용도 | 설정 |
|---------|------|------|
| `select` | 드롭다운 선택 | `{ control: 'select', options: [...] }` |
| `radio` | 라디오 버튼 | `{ control: 'radio', options: [...] }` |
| `boolean` | 토글 스위치 | `{ control: 'boolean' }` |
| `text` | 텍스트 입력 | `{ control: 'text' }` |
| `number` | 숫자 입력 | `{ control: 'number' }` |
| `object` | JSON 편집기 | `{ control: 'object' }` |

### Action 등록

이벤트 콜백 props를 action으로 등록하면 Storybook Actions 패널에서 호출 로그를 확인할 수 있습니다.

```typescript
argTypes: {
  onclick: { action: 'clicked' },
  onchange: { action: 'changed' },
  oninput: { action: 'input' },
  onToggle: { action: 'toggled' },
}
```

또는 `@storybook/test`의 `fn()` 사용:

```typescript
import { fn } from '@storybook/test';

const { Story } = defineMeta({
  component: Button,
  args: {
    onclick: fn(),
  },
});
```

---

## Decorators

### 글로벌 데코레이터 (.storybook/preview.ts)

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/svelte-vite';

const preview: Preview = {
  decorators: [
    (story) => ({
      Component: story.Component,
      props: story.props,
    }),
  ],
};

export default preview;
```

### 컴포넌트 레벨 데코레이터

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MarginDecorator from './MarginDecorator.svelte';

  const { Story } = defineMeta({
    component: MyComponent,
    decorators: [
      ({ parameters }) => ({
        Component: MarginDecorator,
        props: { size: parameters.smallMargin ? 'small' : 'medium' },
      }),
    ],
  });
</script>
```

---

## Chrome Extension 컴포넌트 Story

Chrome API를 사용하는 컴포넌트(ecount-dev-tool)는 글로벌 mock이 필요합니다.

### .storybook/preview.ts에서 chrome mock

```typescript
// .storybook/preview.ts
const chrome_mock = {
  tabs: {
    query: async () => [{ id: 1, url: 'https://zeus01ba1.ecount.com/' }],
    update: async () => ({}),
    onActivated: { addListener: () => {} },
    onUpdated: { addListener: () => {} },
  },
  scripting: {
    executeScript: async () => [{ result: undefined }],
  },
};

if (typeof globalThis.chrome === 'undefined') {
  (globalThis as any).chrome = chrome_mock;
}
```

### Story에서 스토어 초기화

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ServerManager from './ServerManager.svelte';

  const { Story } = defineMeta({
    component: ServerManager,
    title: 'ecount-dev-tool/ServerManager',
  });
</script>

<script>
  import { initializeTabState } from '@/stores/current_tab.svelte';
  // Story 렌더링 전에 스토어 초기화
</script>
```

---

## Story 네이밍 컨벤션

### title 경로

```
패키지명/컴포넌트명
```

예시:
- `uikit/Button`
- `uikit/Select`
- `ecount-dev-tool/ServerManager`
- `ecount-dev-tool/ActionBar`

### Story name

| 패턴 | 설명 | 예시 |
|------|------|------|
| Default | 기본 상태 | `<Story name="Default" />` |
| Variant 이름 | 스타일 변형 | `<Story name="Primary" />` |
| 상태 설명 | 특정 상태 | `<Story name="Disabled" />` |
| 조합 | 여러 변형 비교 | `<Story name="AllVariants" />` |
| 인터랙션 | 사용자 상호작용 | `<Story name="Interactive" />` |

---

## Story 작성 체크리스트

- [ ] `defineMeta`에 component, title 설정
- [ ] 모든 props 변형에 대한 Story 작성
- [ ] children(Snippet)이 있는 컴포넌트는 내용 포함
- [ ] argTypes로 Controls 패널 설정
- [ ] 콜백 props에 action 등록
- [ ] disabled/error 등 특수 상태 Story
- [ ] 여러 변형 비교 Story (AllVariants, AllSizes 등)
- [ ] 인터랙티브 Story (상태 변화 가능)
- [ ] Chrome API 의존 컴포넌트는 mock 설정
