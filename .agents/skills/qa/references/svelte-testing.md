---
name: svelte-testing
description: Svelte 5 컴포넌트 테스트 - @testing-library/svelte + Vitest 기반 Runes 컴포넌트 테스트 패턴
---

# Svelte 5 컴포넌트 테스트 가이드

이 Skill은 QA 에이전트가 Svelte 5 Runes 컴포넌트를 @testing-library/svelte + Vitest로 테스트하는 패턴을 제공합니다.

## 필수 의존성

```json
{
  "devDependencies": {
    "@testing-library/svelte": "catalog:",
    "@testing-library/user-event": "catalog:",
    "@testing-library/jest-dom": "catalog:",
    "vitest": "catalog:",
    "jsdom": "catalog:"
  }
}
```

## Vitest 설정

### svelteTesting 플러그인 (권장)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';

export default defineConfig({
  plugins: [
    svelte({ hot: false }),
    svelteTesting(),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.svelte.test.ts'],
    setupFiles: ['src/test/setup.ts'],
  },
});
```

`svelteTesting()` 플러그인이 자동으로:
- `@testing-library/svelte`를 브라우저 번들로 리졸브
- 테스트 간 자동 cleanup 설정

### .svelte.test.ts 확장자

Svelte 5 Runes(`$state`, `$derived`, `$effect`)를 테스트 파일에서 직접 사용하려면 `.svelte.test.ts` 확장자를 사용합니다. 컴포넌트 렌더링만 테스트하는 경우 `.test.ts`로 충분합니다.

---

## 기본 렌더링

```typescript
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';
import Subject from './MyComponent.svelte';

test('기본 렌더링', () => {
  render(Subject, { name: 'World' });

  expect(screen.getByRole('button')).toBeInTheDocument();
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### Props 전달

```typescript
render(Subject, { variant: 'primary', size: 'md', disabled: false });
```

Props 없이 렌더링:
```typescript
render(Subject);
```

---

## 이벤트 테스트

### @testing-library/user-event (권장)

```typescript
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import Subject from './Button.svelte';

test('클릭 시 onclick 콜백을 호출해야 함', async () => {
  const user = userEvent.setup();
  const onclick = vi.fn();

  render(Subject, { onclick });

  const button = screen.getByRole('button');
  await user.click(button);

  expect(onclick).toHaveBeenCalledOnce();
});
```

### 입력 이벤트

```typescript
test('입력 시 oninput 콜백을 호출해야 함', async () => {
  const user = userEvent.setup();
  const oninput = vi.fn();

  render(Subject, { oninput });

  const input = screen.getByRole('textbox');
  await user.type(input, 'hello');

  expect(oninput).toHaveBeenCalled();
});
```

### Select 변경

```typescript
test('옵션 선택 시 onchange를 호출해야 함', async () => {
  const user = userEvent.setup();
  const onchange = vi.fn();

  render(Subject, {
    options: [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ],
    onchange,
  });

  const select = screen.getByRole('combobox');
  await user.selectOptions(select, 'b');

  expect(onchange).toHaveBeenCalledWith('b');
});
```

---

## $bindable Props 테스트

Svelte 5의 `$bindable()` props는 getter/setter 패턴으로 테스트합니다.

```typescript
test('값 바인딩이 올바르게 동작해야 함', async () => {
  const user = userEvent.setup();
  let value = '';

  render(Subject, {
    get value() { return value; },
    set value(next_value) { value = next_value; },
  });

  const input = screen.getByRole('textbox');
  await user.type(input, 'hello world');

  expect(value).toBe('hello world');
});
```

**권장**: 가능하면 바인딩보다 콜백(onchange, oninput) 테스트를 우선합니다. 양방향 바인딩은 데이터 흐름 추적이 어렵기 때문입니다.

---

## Snippet(children) 전달

### 방법 1: 래퍼 테스트 컴포넌트 (권장, 간단한 경우)

```svelte
<!-- Button.test.svelte -->
<script>
  import Subject from './Button.svelte';
</script>

<Subject>
  <span data-testid="child">Click me</span>
</Subject>
```

```typescript
import { render, screen } from '@testing-library/svelte';
import Wrapper from './Button.test.svelte';

test('children을 렌더링해야 함', () => {
  render(Wrapper);
  expect(screen.getByTestId('child')).toHaveTextContent('Click me');
});
```

### 방법 2: createRawSnippet (프로그래밍 방식)

```typescript
import { render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Subject from './Card.svelte';

test('children을 렌더링해야 함', () => {
  render(Subject, {
    children: createRawSnippet(() => ({
      render: () => '<span data-testid="child">Card content</span>',
    })),
  });

  expect(screen.getByTestId('child')).toHaveTextContent('Card content');
});
```

---

## 쿼리 우선순위

`@testing-library`의 쿼리 우선순위를 따릅니다:

1. **`getByRole`** - 접근성 역할 기반 (최우선)
2. **`getByText`** - 텍스트 내용 기반
3. **`getByPlaceholderText`** - placeholder 기반
4. **`getByDisplayValue`** - 현재 값 기반
5. **`getByTestId`** - data-testid 기반 (최후 수단)

```typescript
// ✅ 좋은 예
screen.getByRole('button');
screen.getByRole('button', { name: '저장' });
screen.getByRole('combobox');
screen.getByRole('textbox');
screen.getByText('Hello World');

// ❌ 지양
screen.getByTestId('save-button');
container.querySelector('.btn-primary');
```

## Testing Library 쿼리 사용 시 주의사항

### getBy vs getAllBy 선택 기준

- **`getBy*`**: 해당 조건을 만족하는 요소가 **정확히 1개**일 때만 사용
- **`getAllBy*`**: 동일 텍스트/역할을 가진 요소가 **2개 이상**일 수 있을 때 사용
- **`queryBy*`**: 요소가 없을 수 있을 때 (조건부 렌더링 검증)

```typescript
// ❌ 동일 텍스트가 여러 번 렌더되는 경우
screen.getByText('=====');  // "Multiple elements found" 에러

// ✅ 여러 요소가 예상되는 경우
const elements = screen.getAllByText('=====');
expect(elements.length).toBeGreaterThan(0);

// ✅ 요소가 없을 수 있는 경우 (조건부 렌더링)
expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
```

### HTML 요소별 키보드 동작

네이티브 HTML 요소는 키보드 상호작용이 다릅니다. 테스트 작성 시 올바른 키를 사용해야 합니다.

| 요소 | 토글/활성화 키 | 비고 |
|------|----------------|------|
| `<input type="checkbox">` | **Space** | Enter는 동작하지 않음 |
| `<input type="radio">` | **Arrow 키** (그룹 내 이동), **Space** (선택) | |
| `<button>` | **Enter**, **Space** | 둘 다 가능 |
| `<a href>` | **Enter** | Space는 페이지 스크롤 |
| `<select>` | **Enter**, **Space** (드롭다운 열기), **Arrow 키** (선택) | |

```typescript
// ❌ checkbox에 Enter 전송 → 토글되지 않음
const user = userEvent.setup();
const checkbox = screen.getByRole('checkbox');
checkbox.focus();
await user.keyboard('{Enter}');

// ✅ checkbox는 Space로 토글
const user = userEvent.setup();
const checkbox = screen.getByRole('checkbox');
checkbox.focus();
await user.keyboard(' ');
```

키보드 상호작용 테스트 작성 전, [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)를 참고하여 올바른 키를 확인합니다.

---

## 조건부 렌더링 테스트

```typescript
test('disabled 상태에서 클릭해도 onclick이 호출되지 않아야 함', async () => {
  const user = userEvent.setup();
  const onclick = vi.fn();

  render(Subject, { disabled: true, onclick });

  const button = screen.getByRole('button');
  expect(button).toBeDisabled();

  await user.click(button);
  expect(onclick).not.toHaveBeenCalled();
});

test('조건부 영역이 표시되지 않아야 함', () => {
  render(Subject, { showTitle: false });

  expect(screen.queryByText('제목')).not.toBeInTheDocument();
});
```

---

## Vanilla Extract CSS 주의사항

jsdom 환경에서 Vanilla Extract CSS 클래스는 실제로 적용되지 않습니다.

```typescript
// ❌ 나쁜 예 - jsdom에서 동작하지 않음
expect(button).toHaveClass('button_variant_primary');

// ✅ 좋은 예 - DOM 구조와 동작으로 검증
expect(screen.getByRole('button')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeDisabled();
expect(screen.getByRole('button')).toHaveTextContent('Click');
```

필요 시 `*.css.ts` 모듈을 mock 처리:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    alias: {
      '../../design/styles/button.css': './test/__mocks__/styles.ts',
    },
  },
});
```

---

## 테스트 구조 (AAA 패턴)

```typescript
describe('Button', () => {
  it('기본 상태로 렌더링해야 함', () => {
    // Arrange
    render(Subject, { children: createRawSnippet(() => ({
      render: () => '<span>Click</span>',
    }))});

    // Act (렌더링 자체가 act)

    // Assert
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });
});
```

---

## 체크리스트

테스트 작성 완료 후:

- [ ] 모든 props 변형 테스트 (기본값 포함)
- [ ] 이벤트 콜백 호출 검증 (onclick, onchange, oninput)
- [ ] 콜백 미전달 시 에러 없음 확인
- [ ] disabled 상태 동작 검증
- [ ] 조건부 렌더링 검증 (있음/없음)
- [ ] Snippet(children) 렌더링 검증
- [ ] $bindable 양방향 바인딩 검증 (해당 시)
- [ ] 접근성 쿼리 사용 (getByRole 우선)
- [ ] 테스트 설명 한글 작성
