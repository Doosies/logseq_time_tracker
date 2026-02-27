# Testing

## 테스트 프레임워크

이 프로젝트는 **Vitest** + **Svelte Testing Library** + **Storybook play function**을 사용합니다.

## 테스트 실행

### 전체 테스트

```bash
pnpm test
```

### Watch 모드

```bash
pnpm test -- --watch
```

## Svelte 컴포넌트 테스트

### Svelte Testing Library

```typescript
import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import App from '../App.svelte';

describe('App', () => {
    it('제목이 렌더링되어야 함', () => {
        render(App);
        expect(screen.getByText('설정')).toBeInTheDocument();
    });
});
```

### 키보드 인터랙션 테스트

```typescript
import { fireEvent } from '@testing-library/svelte';

it('Space 키로 체크박스가 토글되어야 함', async () => {
    render(App);
    const checkbox = screen.getByRole('checkbox');
    await fireEvent.keyDown(checkbox, { key: ' ' });
    expect(checkbox).toBeChecked();
});
```

::: warning HTML 요소별 키보드 동작

- `<button>`: Enter, Space 모두 클릭
- `<input type="checkbox">`: **Space**만 토글 (Enter 아님)
- `<a>`: Enter만 클릭
  :::

## Storybook Play Function

UI 컴포넌트의 인터랙션 테스트는 Storybook play function으로 수행합니다:

```typescript
import { within, userEvent } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ButtonStoryWrapper from './ButtonStoryWrapper.svelte';

const meta: Meta = {
    title: 'Components/Button',
    component: ButtonStoryWrapper,
};
export default meta;

type Story = StoryObj;

export const Primary: Story = {
    args: { variant: 'primary' },
};

export const ClickTest: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await userEvent.click(button);
    },
};
```

```bash
pnpm storybook
```

## 서비스 단위 테스트

비즈니스 로직은 순수 Vitest로 테스트합니다:

```typescript
import { parseEcountUrl } from '#services/url_service';

describe('parseEcountUrl', () => {
    it('zeus URL을 올바르게 파싱해야 함', () => {
        const result = parseEcountUrl('https://zeus01ba1.ecount.com/ec5/view/erp');
        expect(result?.environment).toBe('zeus');
        expect(result?.v5_domain).toBe('zeus01');
    });
});
```

## 모범 사례

1. **사용자 관점으로 테스트**: 구현 세부사항이 아닌 사용자 행동을 테스트
2. **격리된 테스트**: 각 테스트는 독립적으로 실행 가능
3. **접근성 검증**: `aria-label`, `role` 속성을 활용한 쿼리 우선
4. **Storybook 활용**: 복잡한 UI 인터랙션은 play function으로 검증
