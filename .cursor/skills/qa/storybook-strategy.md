---
name: storybook-strategy
description: Svelte Storybook Story 작성 - CSF3 (.stories.ts) + StoryWrapper 패턴
---

# Svelte Storybook Story 작성 가이드

이 Skill은 QA 에이전트가 Svelte 5 컴포넌트의 Storybook Story를 작성하는 패턴을 제공합니다.

## 아키텍처

- **Story 형식**: `.stories.ts` (CSF3) 만 사용
- **Svelte 컴파일**: `.storybook/main.ts`의 커스텀 `svelteCompilePlugin()`이 처리
- **테스트 import**: `storybook/test`에서 `expect`, `fn`, `within`, `userEvent` 사용
- **addon-svelte-csf 미사용**: `@storybook/addon-svelte-csf`는 제거됨

### `.stories.svelte`를 사용하지 않는 이유

커스텀 Svelte 컴파일 플러그인이 `.svelte` / `.svelte.ts` 파일을 직접 컴파일하므로, addon 없이 CSF3 TS 포맷만으로 충분합니다. TS 파일은 타입 검증과 IDE 자동완성이 더 강력합니다.

---

## Story 파일 위치

모든 Story 파일(`.stories.ts`)과 StoryWrapper는 각 컴포넌트의 `__tests__/` 디렉토리에 배치합니다.

```
ComponentName/
├── ComponentName.svelte
├── index.ts
└── __tests__/
    ├── ComponentName.stories.ts
    └── ComponentNameStoryWrapper.svelte  (필요 시)
```

Storybook `main.ts`의 glob 패턴 `../packages/*/src/**/*.stories.ts`이 `__tests__/` 하위도 탐지합니다.

---

## Story 파일 구조

### 단순 컴포넌트 (children 불필요)

props만으로 완전히 제어되는 컴포넌트는 직접 Story를 작성합니다.

```typescript
// __tests__/Select.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import Select from '../Select.svelte';

const meta = {
    component: Select,
    title: 'uikit/Select',
    args: {
        onchange: fn(),
    },
    argTypes: {
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { options: [{ value: 'a', label: 'A' }] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeInTheDocument();
    },
};
```

**해당 컴포넌트**: `Select`, `TextInput`, `ToggleInput`

### Snippet(children) 컴포넌트 → StoryWrapper 패턴

`children: Snippet`을 받는 컴포넌트는 `.stories.ts`에서 Svelte 템플릿을 전달할 수 없습니다. 이를 해결하기 위해 StoryWrapper를 사용합니다.

#### 1단계: StoryWrapper 작성

```svelte
<!-- __tests__/ButtonStoryWrapper.svelte -->
<script lang="ts">
    import type { ButtonVariant, ButtonSize } from '../../../design/types';
    import Button from '../Button.svelte';

    interface Props {
        label?: string;
        variant?: ButtonVariant;
        size?: ButtonSize;
        disabled?: boolean;
        fullWidth?: boolean;
        onclick?: () => void;
    }

    let { label = 'Button', ...rest }: Props = $props();
</script>

<Button {...rest}>{label}</Button>
```

**핵심**: children을 `label` 같은 단순 prop으로 변환합니다.

#### 2단계: Story에서 Wrapper 사용

```typescript
// __tests__/Button.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import ButtonStoryWrapper from './ButtonStoryWrapper.svelte';

const meta = {
    component: ButtonStoryWrapper,
    title: 'uikit/Button',
    args: { onclick: fn() },
    argTypes: {
        variant: { control: 'select', options: ['primary', 'secondary', 'accent'] },
        disabled: { control: 'boolean' },
    },
} satisfies Meta<typeof ButtonStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: { variant: 'primary', label: 'Click me' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button')).toBeInTheDocument();
    },
};
```

#### StoryWrapper의 두 가지 변형

**A. label 변환 (단일 텍스트 children)**

```svelte
<!-- __tests__/ButtonStoryWrapper.svelte -->
<script lang="ts">
    import Button from '../Button.svelte';
    interface Props { label?: string; variant?: ButtonVariant; /* ... */ }
    let { label = 'Button', ...rest }: Props = $props();
</script>
<Button {...rest}>{label}</Button>
```

**B. scenario 분기 (복합 children 조합)**

```svelte
<!-- __tests__/ButtonGroupStoryWrapper.svelte -->
<script lang="ts">
    import ButtonGroup from '../ButtonGroup.svelte';
    import Button from '../../Button/Button.svelte';
    interface Props { scenario?: 'default' | 'mixed' | 'withDisabled'; }
    let { scenario = 'default' }: Props = $props();
</script>
<ButtonGroup>
    {#if scenario === 'default'}
        <Button variant="primary">첫 번째</Button>
        <Button variant="primary">두 번째</Button>
    {:else if scenario === 'mixed'}
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
    {/if}
</ButtonGroup>
```

**해당 컴포넌트**: `Button`, `ButtonGroup`, `Card`, `Section`

### Chrome Extension 컴포넌트 (스토어 의존)

스토어 초기화가 필요한 컴포넌트는 StoryWrapper에서 `onMount`로 처리합니다.

```svelte
<!-- __tests__/ServerManagerStoryWrapper.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeTabState } from '#stores/current_tab.svelte';
    import ServerManager from '../ServerManager.svelte';

    interface Props { url?: string; }
    let { url }: Props = $props();

    onMount(async () => {
        (globalThis as any).__storybook_set_tab_url?.(url);
        await initializeTabState();
    });
</script>
<ServerManager />
```

```typescript
// __tests__/ServerManager.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ServerManagerStoryWrapper from './ServerManagerStoryWrapper.svelte';

const meta = {
    component: ServerManagerStoryWrapper,
    title: 'ecount-dev-tool/ServerManager',
} satisfies Meta<typeof ServerManagerStoryWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ZeusEnvironment: Story = {
    args: { url: 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1' },
};
```

---

## Play Function (인터랙션 테스트)

UI 컴포넌트의 렌더링/인터랙션 테스트는 Storybook play function으로 수행합니다.
별도 `.test.ts` 파일 대신 Story의 `play`에서 처리합니다.

### 기본 렌더링 검증

```typescript
play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button')).toBeInTheDocument();
    await expect(canvas.getByText('Click me')).toBeInTheDocument();
},
```

### 클릭 이벤트 검증

```typescript
export const WithClickHandler: Story = {
    args: { variant: 'primary', label: 'Click' },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await userEvent.click(button);
        await expect(args['onclick']).toHaveBeenCalledOnce();
    },
};
```

### disabled 검증

```typescript
export const Disabled: Story = {
    args: { disabled: true, variant: 'primary', label: 'Disabled' },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await expect(button).toBeDisabled();
        await userEvent.click(button);
        await expect(args['onclick']).not.toHaveBeenCalled();
    },
};
```

### select 변경 검증

```typescript
play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const select = canvas.getByRole('combobox');
    await userEvent.selectOptions(select, 'b');
    await expect(args['onchange']).toHaveBeenCalledWith('b');
},
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

### Action 등록 (`fn()`)

`storybook/test`의 `fn()`으로 콜백을 등록합니다.

```typescript
import { fn } from 'storybook/test';

const meta = {
    component: Button,
    args: {
        onclick: fn(),
        onchange: fn(),
    },
} satisfies Meta<typeof Button>;
```

play function에서 `args['onclick']`으로 호출 여부를 검증합니다.

---

## Chrome Extension mock

`.storybook/preview.ts`에서 글로벌 chrome API mock을 설정합니다.

```typescript
let storybook_tab_url = 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1';

if (typeof globalThis.chrome === 'undefined') {
    (globalThis as Record<string, unknown>).chrome = {
        tabs: {
            query: async () => [{ id: 1, url: storybook_tab_url }],
            update: async () => ({}),
            onActivated: { addListener: () => {} },
            onUpdated: { addListener: () => {} },
        },
        scripting: {
            executeScript: async () => [{ result: undefined }],
        },
    };
}

(globalThis as Record<string, unknown>).__storybook_set_tab_url = (url: string) => {
    storybook_tab_url = url;
};
```

StoryWrapper에서 `__storybook_set_tab_url`을 호출하여 URL을 변경합니다.

---

## Story 네이밍 컨벤션

### title 경로

```
패키지명/컴포넌트명
```

- `uikit/Button`
- `uikit/Select`
- `ecount-dev-tool/ServerManager`
- `ecount-dev-tool/ActionBar`

### Story export 이름

| 패턴 | 설명 | 예시 |
|------|------|------|
| 기본 상태 | 기본 props | `Default` |
| Variant | 스타일 변형 | `Primary`, `Secondary`, `Accent` |
| 크기 | 크기 변형 | `Small`, `Medium` |
| 상태 | 특수 상태 | `Disabled`, `FullWidth` |
| 인터랙션 | 이벤트 검증 | `WithClickHandler`, `WithChangeHandler` |
| 시나리오 | 복합 구성 | `MixedVariants`, `WithDisabled` |

---

## Storybook 설정 구조

```
.storybook/
├── main.ts          # svelteCompilePlugin() + vanillaExtractPlugin()
└── preview.ts       # chrome mock, light_theme, controls 설정

stories 경로: ../packages/*/src/**/*.stories.ts
```

`main.ts`의 `svelteCompilePlugin()`이 `.svelte`, `.svelte.ts`, `.svelte.js` 파일을 직접 컴파일합니다.

### autodocs 및 a11y 활성화

**autodocs 설정**:
- `preview.ts`에 `tags: ['autodocs']` 추가 → 모든 스토리에 자동 문서 페이지 생성
- 각 스토리의 `meta`에 `parameters.docs.description.component`로 컴포넌트 설명 추가

**a11y 설정**:
- `@storybook/addon-a11y`를 `main.ts`의 `addons`에 등록
- `preview.ts`의 `parameters.a11y`에 글로벌 a11y 옵션 설정
- 특정 스토리에서 규칙 비활성화가 필요한 경우 `parameters.a11y.config.rules`로 개별 설정

```typescript
// preview.ts
const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: {
      config: {},
      options: { restoreScroll: true },
    },
  },
};
```

```typescript
// 특정 스토리에서 region 규칙 비활성화
const meta = {
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'region', enabled: false }],
      },
    },
  },
} satisfies Meta<typeof Component>;
```

**주의**: `addon-essentials`만으로는 docs/a11y가 포함되지 않는 Storybook 버전이 있습니다. addon-docs, addon-a11y를 `main.ts`에 명시적으로 등록하세요.

---

## Story 작성 체크리스트

- [ ] `.stories.ts` CSF3 포맷 사용
- [ ] `satisfies Meta<typeof Component>` 타입 검증
- [ ] children 컴포넌트는 StoryWrapper 작성
- [ ] `storybook/test`에서 `fn()`, `expect`, `within`, `userEvent` import
- [ ] 모든 props 변형에 대한 Story
- [ ] argTypes로 Controls 패널 설정
- [ ] 콜백 props에 `fn()` 등록
- [ ] play function으로 렌더링/인터랙션 검증
- [ ] disabled/error 등 특수 상태 Story
- [ ] Chrome API 의존 컴포넌트는 StoryWrapper에서 스토어 초기화
