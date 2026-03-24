# Svelte 5 컴포넌트 추가 워크플로우

이 문서는 `{ui-lib-path}`에 새 Svelte 5 컴포넌트를 추가할 때 사용하는 도메인 특화 워크플로우입니다. (`{ui-lib-path}`는 대상 UI 라이브러리 패키지 경로, 예: `packages/design-system`)
프로젝트의 기존 패턴(Svelte 5 Runes, Vanilla Extract, Storybook)을 따릅니다.

---

## 0. 사전 확인

워크플로우 시작 전 확인:

- [ ] 컴포넌트 이름 확정 (`PascalCase`, 예: `Textarea`, `DataGrid`)
- [ ] `{ui-lib-path}` 패키지 대상
- [ ] plan-execution 워크플로우 0단계(사이클 메트릭) 적용 여부 확인 (Feature/Refactor 시)

---

## 1. 기존 패턴 분석

**담당**: planner 또는 developer (탐색)

### 1.1 유사한 컴포넌트 찾기

- [ ] `{ui-lib-path}/src/components/` 내 유사 컴포넌트 검색
- [ ] Props 패턴 확인 (예: `value`, `disabled`, `placeholder`, `oninput` 등)
- [ ] `$bindable()` 사용 여부 확인

**참고 예시** (Textarea):

```typescript
// 패턴: bindable value + oninput 콜백
let { value = $bindable(), oninput, ... }: TextareaProps = $props();
```

### 1.2 스토리 구조 확인

- [ ] `__tests__/{ComponentName}.stories.ts` 파일 패턴 확인
- [ ] `play` 함수로 상호작용/접근성 검증 패턴 확인
- [ ] `argTypes` 정의 방식 확인

**참고 예시**:

```typescript
const meta = {
    component: Textarea,
    title: '{ui-lib}/Textarea',
    args: { oninput: fn() },
    argTypes: { disabled: { control: 'boolean' }, ... },
} satisfies Meta<typeof Textarea>;
```

### 1.3 스타일 패턴 확인

- [ ] `{ui-lib-path}/src/design/styles/` 내 `*.css.ts` 파일 구조 확인
- [ ] `theme_vars` 사용 방식 확인

---

## 2. 컴포넌트 생성

**담당**: developer

### 2.1 디렉토리 구조

```
{ui-lib-path}/src/components/{ComponentName}/
├── {ComponentName}.svelte
├── index.ts
└── __tests__/
    ├── {ComponentName}.stories.ts
    └── {ComponentName}.test.ts  (선택)
```

### 2.2 컴포넌트 파일 작성

**파일**: `{ui-lib-path}/src/components/{ComponentName}/{ComponentName}.svelte`

- [ ] Svelte 5 Runes 사용 (`$props()`, `$derived`, `$effect`)
- [ ] TypeScript 타입 정의 (`interface` 또는 `type`)
- [ ] 변수명 `snake_case` 준수
- [ ] 함수명 `camelCase` 준수

**코드 예시**:

```svelte
<script lang="ts">
    import { ComponentName as PrimitiveComponentName } from '../../primitives/ComponentName';
    import * as styles from '../../design/styles/component_name.css';

    interface ComponentNameProps {
        value?: string | undefined;
        disabled?: boolean | undefined;
        onchange?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        disabled = false,
        onchange,
    }: ComponentNameProps = $props();

    const class_name = $derived(
        [styles.component_element, disabled && styles.component_disabled].filter(Boolean).join(' '),
    );
</script>

<div class={styles.component_container}>
    <PrimitiveComponentName class={class_name} bind:value {disabled} {onchange} />
</div>
```

### 2.3 index.ts export

```typescript
export { default as ComponentName } from './ComponentName.svelte';
```

### 2.4 스타일 파일 (필요 시)

**파일**: `{ui-lib-path}/src/design/styles/component_name.css.ts`

- [ ] Vanilla Extract `style()` 사용
- [ ] `theme_vars` 사용 (색상, 간격, 폰트 등)

---

## 3. 스토리 생성

**담당**: developer 또는 qa

**파일**: `__tests__/{ComponentName}.stories.ts`

- [ ] `Meta`, `StoryObj` 타입 사용
- [ ] `title` 형식: `{ui-lib}/{ComponentName}`
- [ ] `argTypes` 정의
- [ ] 각 스토리에 `play` 함수로 상호작용 테스트
- [ ] 접근성 테스트 포함 (role, aria)

**코드 예시**:

```typescript
import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import ComponentName from '../ComponentName.svelte';

const meta = {
    component: ComponentName,
    title: '{ui-lib}/ComponentName',
    parameters: {
        docs: {
            description: { component: '컴포넌트 설명' },
        },
    },
    args: { onchange: fn() },
    argTypes: {
        disabled: { control: 'boolean', description: '비활성화 상태' },
        value: { control: 'text', description: '값' },
    },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const element = canvas.getByRole('textbox'); // 또는 role에 맞게
        await expect(element).toBeInTheDocument();
        await expect(element).not.toBeDisabled();
    },
};

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeDisabled();
    },
};
```

---

## 4. 테스트 작성

**담당**: qa

**파일**: `__tests__/{ComponentName}.test.ts` (선택, 단위 테스트 필요 시)

- [ ] Vitest + Testing Library 사용
- [ ] 테스트 설명 한글로 작성
- [ ] 단위 테스트 + 통합 테스트
- [ ] 커버리지 80% 이상 목표

**코드 예시**:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/svelte';
import ComponentName from '../ComponentName.svelte';

describe('ComponentName', () => {
    it('기본 렌더링 시 렌더된다', () => {
        render(ComponentName);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('disabled 시 비활성화된다', () => {
        render(ComponentName, { props: { disabled: true } });
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});
```

---

## 5. 문서화

**담당**: docs

- [ ] JSDoc 주석 (컴포넌트, Props)
- [ ] Props 설명
- [ ] 사용 예시 (Storybook docs에 포함 가능)

**예시**:

```svelte
<!--
  ComponentName: 컴포넌트 설명

  @prop {string} [value] - 값
  @prop {boolean} [disabled=false] - 비활성화 여부
  @prop {function} [onchange] - 변경 시 콜백
-->
```

---

## 6. 품질 검증

**담당**: qa

**실행 순서**:

1. [ ] **ReadLints** (변경된 파일 경로 지정)
2. [ ] **format** (프로젝트 스크립트) (워크스페이스 루트)
3. [ ] **test** (프로젝트 스크립트) (해당 패키지 스코프 또는 루트 스크립트)
4. [ ] **lint** (프로젝트 스크립트)
5. [ ] **type-check** (프로젝트 스크립트) (워크스페이스 루트)
6. [ ] **build** (프로젝트 스크립트)

---

## 7. 후속 단계 (plan-execution 워크플로우 연동)

- [ ] Docs: CHANGELOG 업데이트 (필요 시)
- [ ] git-workflow: 커밋 메시지 생성, 커밋 (코드 변경 시)

---

## 체크리스트 요약

| 단계 | 항목 | 상태 |
|------|------|------|
| 1 | 기존 패턴 분석 | ☐ |
| 2 | 컴포넌트 생성 (svelte, index, styles) | ☐ |
| 3 | 스토리 생성 (play 함수, 접근성) | ☐ |
| 4 | 테스트 작성 | ☐ |
| 5 | 문서화 | ☐ |
| 6 | 품질 검증 | ☐ |

---

## 참고

- [플랜 실행 워크플로우](../plan-execution-workflow.md)
- [프로젝트 컨벤션](../../skills/project-conventions/SKILL.md)
- [Developer SKILL](../../skills/developer/SKILL.md)
- [QA SKILL](../../skills/qa/SKILL.md)
