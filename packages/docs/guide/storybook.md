# Storybook

## 개요

이 프로젝트는 **Storybook 10**을 사용하여 UIKit과 Ecount Dev Tool 컴포넌트를 시각적으로 개발하고 테스트합니다.

## 실행

```bash
pnpm storybook
```

## 스토리 작성

CSF3 (Component Story Format 3) 형식으로 작성합니다. Svelte 컴포넌트 중 children이 필요한 경우 `*StoryWrapper.svelte` 파일을 사용합니다.

### 기본 스토리

```typescript
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ButtonStoryWrapper from './ButtonStoryWrapper.svelte';

const meta: Meta = {
    title: 'Components/Button',
    component: ButtonStoryWrapper,
    parameters: {
        docs: {
            description: {
                component: 'Primary action button',
            },
        },
    },
};
export default meta;

type Story = StoryObj;

export const Primary: Story = {
    args: { variant: 'primary', label: '버튼' },
};

export const Secondary: Story = {
    args: { variant: 'secondary', label: '버튼' },
};
```

### Play Function (인터랙션 테스트)

```typescript
import { within, userEvent, expect } from 'storybook/test';

export const ClickTest: Story = {
    args: { variant: 'primary', label: '클릭' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await userEvent.click(button);
        await expect(button).toBeInTheDocument();
    },
};
```

## 애드온

- **addon-docs**: 자동 문서 생성 (autodocs)
- **addon-a11y**: 접근성 검사

## 설정

`.storybook/` 디렉토리에서 전역 설정을 관리합니다:

```
.storybook/
├── main.ts         # 스토리 경로, 애드온, 프레임워크 설정
└── preview.ts      # 글로벌 autodocs, a11y 파라미터
```

### autodocs

`preview.ts`에서 전역 autodocs가 활성화되어 있어, 모든 스토리에 자동으로 Docs 탭이 생성됩니다.

## StoryWrapper 패턴

Svelte 컴포넌트에 children snippet이 필요한 경우 직접 스토리로 사용할 수 없습니다. 이때 래퍼 컴포넌트를 사용합니다:

```svelte
<!-- CardStoryWrapper.svelte -->
<script lang="ts">
    import { Card } from '@personal/uikit';

    let { header = 'Header', body = 'Body', footer = '' } = $props();
</script>

<Card.Root>
    <Card.Header>{header}</Card.Header>
    <Card.Body>{body}</Card.Body>
    {#if footer}
        <Card.Footer>{footer}</Card.Footer>
    {/if}
</Card.Root>
```

## 테스트 실행

Storybook play function 테스트는 브라우저에서 직접 실행됩니다. Storybook UI의 Interactions 패널에서 결과를 확인할 수 있습니다.
