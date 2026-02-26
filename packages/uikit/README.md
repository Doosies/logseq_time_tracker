# @personal/uikit

Svelte 5 기반 공유 UI 컴포넌트 라이브러리입니다. vanilla-extract를 사용한 타입 안전한 CSS-in-TypeScript 스타일링을 제공합니다.

## 📦 설치

```bash
pnpm add @personal/uikit
```

## 🚀 빠른 시작

### 기본 사용법

```svelte
<script>
  import { Button, Card, TextInput } from '@personal/uikit';
</script>

<Card.Root>
  <Card.Body>
    <TextInput placeholder="이름을 입력하세요" />
    <Button variant="primary" onclick={() => console.log('클릭!')}>
      제출
    </Button>
  </Card.Body>
</Card.Root>
```

### 테마 설정

```svelte
<script>
  import '@personal/uikit/design';
  // 또는 특정 테마만 import
  import { light_theme } from '@personal/uikit/design';
</script>
```

## 📚 컴포넌트

### Simple 컴포넌트

Button, ButtonGroup, TextInput, Select는 단일 export로 사용합니다.

---

### Button

버튼 컴포넌트입니다.

**Props:**
- `variant?: 'primary' | 'secondary' | 'accent'` - 버튼 스타일 (기본값: `'primary'`)
- `size?: 'sm' | 'md'` - 버튼 크기 (기본값: `'md'`)
- `disabled?: boolean` - 비활성화 여부 (기본값: `false`)
- `fullWidth?: boolean` - 전체 너비 사용 여부 (기본값: `false`)
- `onclick?: () => void` - 클릭 핸들러

**예제:**
```svelte
<script>
  import { Button } from '@personal/uikit';
</script>

<Button variant="primary" onclick={() => alert('클릭!')}>
  기본 버튼
</Button>

<Button variant="secondary" size="sm" disabled>
  작은 버튼 (비활성화)
</Button>

<Button variant="accent" fullWidth>
  전체 너비 버튼
</Button>
```

---

### ButtonGroup

여러 버튼을 그룹으로 묶는 컴포넌트입니다.

**예제:**
```svelte
<script>
  import { ButtonGroup, Button } from '@personal/uikit';
</script>

<ButtonGroup>
  <Button variant="primary">저장</Button>
  <Button variant="secondary">취소</Button>
</ButtonGroup>
```

---

### TextInput

텍스트 입력 필드 컴포넌트입니다.

**Props:**
- `value?: string` - 입력값 (양방향 바인딩)
- `placeholder?: string` - 플레이스홀더 텍스트
- `disabled?: boolean` - 비활성화 여부 (기본값: `false`)
- `oninput?: (value: string) => void` - 입력 핸들러

**예제:**
```svelte
<script>
  import { TextInput } from '@personal/uikit';
  
  let username = '';
</script>

<TextInput 
  bind:value={username}
  placeholder="사용자명을 입력하세요"
  oninput={(value) => console.log('입력:', value)}
/>
```

---

### Select

드롭다운 선택 컴포넌트입니다.

**Props:**
- `value?: string` - 선택된 값 (양방향 바인딩)
- `options: SelectOption[]` - 선택 옵션 배열
- `disabled?: boolean` - 비활성화 여부 (기본값: `false`)
- `onchange?: (value: string) => void` - 변경 핸들러

**타입:**
```typescript
interface SelectOption {
  value: string;
  label: string;
}
```

**예제:**
```svelte
<script>
  import { Select } from '@personal/uikit';
  import type { SelectOption } from '@personal/uikit';
  
  let selected = 'option1';
  const options: SelectOption[] = [
    { value: 'option1', label: '옵션 1' },
    { value: 'option2', label: '옵션 2' },
    { value: 'option3', label: '옵션 3' },
  ];
</script>

<Select 
  bind:value={selected}
  {options}
  onchange={(value) => console.log('선택:', value)}
/>
```

---

### Compound 컴포넌트

Card, Section, ToggleInput, Popover, Toast, CheckboxList, Dnd는 namespace export로 sub-component를 가집니다.

---

### Card (Compound)

카드 컨테이너 컴포넌트입니다.

| Sub-component | 용도 |
|---------------|------|
| `Card.Root` | 카드 컨테이너 (필수) |
| `Card.Header` | 헤더 영역 |
| `Card.Body` | 본문 영역 |
| `Card.Footer` | 푸터 영역 |

**Props:**
- `Card.Root`: `class?: string`
- `Card.Header`, `Card.Body`, `Card.Footer`: `children`, `class?: string`

**예제:**
```svelte
<script>
  import * as Card from '@personal/uikit';
</script>

<Card.Root>
  <Card.Header>카드 제목</Card.Header>
  <Card.Body>
    <p>카드 내용입니다.</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">확인</Button>
  </Card.Footer>
</Card.Root>
```

---

### Section (Compound)

섹션 레이아웃 컴포넌트입니다.

| Sub-component | 용도 |
|---------------|------|
| `Section.Root` | 섹션 컨테이너 (필수) |
| `Section.Header` | 헤더 영역 |
| `Section.Title` | 제목 |
| `Section.Action` | 액션 버튼 영역 |
| `Section.Content` | 본문 영역 |

**Props:**
- `Section.Root`: `class?: string`
- 기타: `children`, `class?: string`

**예제:**
```svelte
<script>
  import * as Section from '@personal/uikit';
</script>

<Section.Root>
  <Section.Header>
    <Section.Title>섹션 제목</Section.Title>
    <Section.Action>
      <button type="button">편집</button>
    </Section.Action>
  </Section.Header>
  <Section.Content>
    <p>섹션 내용입니다.</p>
  </Section.Content>
</Section.Root>
```

---

### ToggleInput (Compound)

텍스트 모드와 Select 모드를 전환하는 입력 컴포넌트입니다.

| Sub-component | 용도 |
|---------------|------|
| `ToggleInput.Root` | 컨테이너 (필수) |
| `ToggleInput.Prefix` | 접두사 레이블 |
| `ToggleInput.Toggle` | 모드 전환 버튼 |

**Props:**
- `ToggleInput.Root`: `value`, `isTextMode` (양방향 바인딩), `onToggle?: () => void`, `class?: string`
- `ToggleInput.Prefix`: `children`, `class?: string`
- `ToggleInput.Toggle`: `label?: string`, `children?: Snippet`, `class?: string`

**예제:**
```svelte
<script>
  import * as ToggleInput from '@personal/uikit';
  import { TextInput, Select } from '@personal/uikit';
  
  let value = $state('a');
  let is_text_mode = $state(false);
  const options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];
</script>

<ToggleInput.Root bind:value bind:isTextMode={is_text_mode}>
  <ToggleInput.Prefix>레이블</ToggleInput.Prefix>
  {#if is_text_mode}
    <TextInput bind:value />
  {:else}
    <Select bind:value options={options} />
  {/if}
  <ToggleInput.Toggle>
    {is_text_mode ? '🔽' : '✏️'}
  </ToggleInput.Toggle>
</ToggleInput.Root>
```

---

### Popover (Compound)

클릭 시 팝오버 콘텐츠를 표시하는 컴포넌트입니다. 외부 클릭 또는 Escape 키로 자동 닫힘.

| Sub-component | 용도 |
|---------------|------|
| `Popover.Root` | 컨테이너 (필수) |
| `Popover.Trigger` | 트리거 버튼 |
| `Popover.Content` | 팝오버 콘텐츠 패널 |

**Props:**
- `Popover.Root`: `children`, `class?: string`
- `Popover.Trigger`: `children`, `class?: string`
- `Popover.Content`: `children`, `class?: string`, `role?: string` (기본: `'dialog'`), `label?: string` (ARIA label)

**예제:**
```svelte
<script>
  import * as Popover from '@personal/uikit';
</script>

<Popover.Root>
  <Popover.Trigger>설정</Popover.Trigger>
  <Popover.Content label="팝오버 메뉴">
    <p>팝오버 내용</p>
  </Popover.Content>
</Popover.Root>
```

---

### Toast (Compound)

일시적 알림 메시지를 표시하는 컴포넌트입니다. `Toast.Provider`의 `duration`에 따라 자동 타이머로 사라집니다.

| Sub-component | 용도 |
|---------------|------|
| `Toast.Provider` | 컨텍스트 제공 (필수) - `show(message)` via context |
| `Toast.Root` | 토스트 메시지 렌더 영역 |

**Props:**
- `Toast.Provider`: `duration?: number` (기본: 2500ms), `children`
- `Toast.Root`: `class?: string`

**Context:** `Toast.Provider` 하위 컴포넌트에서 `getContext('toast')`로 `show(message: string)`, `hide(id?: number)` 접근

**예제:**
```svelte
<!-- App.svelte -->
<script>
  import * as Toast from '@personal/uikit';
  import ToastTrigger from './ToastTrigger.svelte';
</script>

<Toast.Provider duration={3000}>
  <ToastTrigger />
  <Toast.Root />
</Toast.Provider>
```

```svelte
<!-- ToastTrigger.svelte (Toast.Provider의 자식에서 getContext 호출) -->
<script>
  import { getContext } from 'svelte';
  const ctx = getContext<{ show: (message: string) => void }>('toast');
</script>
<button type="button" onclick={() => ctx.show('저장되었습니다.')}>토스트 표시</button>
```

---

### CheckboxList (Compound)

드래그앤드롭으로 순서 변경이 가능한 체크박스 리스트입니다.

| Sub-component | 용도 |
|---------------|------|
| `CheckboxList.Root` | 리스트 컨테이너 (필수) |
| `CheckboxList.Item` | 체크박스 항목 |

**Props:**
- `CheckboxList.Root`: `items: T[]` (T extends `{ id: string | number }`), `type?: string`, `onconsider`, `onfinalize`, `children`, `class?: string`
- `CheckboxList.Item`: `checked`, `disabled`, `ontoggle`, `children`, `class?: string`

**예제:**
```svelte
<script>
  import * as CheckboxList from '@personal/uikit';
  import type { DndEvent } from '@personal/uikit';
  
  let items = $state([
    { id: 'a', label: 'Item A', visible: true },
    { id: 'b', label: 'Item B', visible: false },
  ]);
  
  function handleConsider(e: CustomEvent<DndEvent<typeof items[0]>>) {
    items = e.detail.items;
  }
  function handleFinalize(e: CustomEvent<DndEvent<typeof items[0]>>) {
    items = e.detail.items;
  }
  function toggle(id: string) {
    items = items.map(i => i.id === id ? { ...i, visible: !i.visible } : i);
  }
</script>

<CheckboxList.Root {items} onconsider={handleConsider} onfinalize={handleFinalize}>
  {#each items as item (item.id)}
    <CheckboxList.Item checked={item.visible} ontoggle={() => toggle(item.id)}>
      {item.label}
    </CheckboxList.Item>
  {/each}
</CheckboxList.Root>
```

---

### Dnd (Compound)

드래그앤드롭 영역을 구성하는 컴포넌트입니다.

| Sub-component | 용도 |
|---------------|------|
| `Dnd.Zone` | DnD 영역 컨테이너 (필수) |
| `Dnd.Row` | 드래그 가능한 행 |
| `Dnd.Handle` | 드래그 핸들 |

**Props:**
- `Dnd.Zone`: `items: T[]`, `type?: string`, `flipDurationMs?: number`, `dragDisabled?: boolean`, `dropTargetStyle?: Record<string, string>`, `onconsider`, `onfinalize`, `children`, `class?: string`
- `Dnd.Row`: `children`, `class?: string`
- `Dnd.Handle`: `variant?: 'bar' | 'icon'`, `label?: string`

**타입:**
```typescript
// svelte-dnd-action에서 re-export
type DndEvent<T> = { ... };
```

**예제:**
```svelte
<script>
  import * as Dnd from '@personal/uikit';
  import type { DndEvent } from '@personal/uikit';
  
  let items = $state([
    { id: '1', label: 'Row 1' },
    { id: '2', label: 'Row 2' },
    { id: '3', label: 'Row 3' },
  ]);
  
  function handleConsider(e: CustomEvent<DndEvent<typeof items[0]>>) {
    items = e.detail.items;
  }
  function handleFinalize(e: CustomEvent<DndEvent<typeof items[0]>>) {
    items = e.detail.items;
  }
</script>

<Dnd.Zone {items} onconsider={handleConsider} onfinalize={handleFinalize}>
  {#each items as item (item.id)}
    <Dnd.Row>
      <Dnd.Handle variant="icon" label="드래그하여 순서 변경" />
      <span>{item.label}</span>
    </Dnd.Row>
  {/each}
</Dnd.Zone>
```

---

## 🎯 Actions

Svelte `use:` 액션으로 재사용 가능한 동작을 제공합니다.

### clickOutside

요소 외부 클릭 또는 Escape 키 입력 시 콜백을 실행합니다. 팝업, 드롭다운 등의 외부 클릭 닫기에 사용합니다.

```svelte
<script>
  import { clickOutside } from '@personal/uikit';
  
  let is_open = false;
</script>

<div use:clickOutside={() => { is_open = false }}>
  {#if is_open}
    <p>팝업 내용</p>
  {/if}
</div>
```

---

### blockDragFromInteractive

DnD 영역에서 버튼, input 등 인터랙티브 요소에서 드래그가 시작되지 않도록 막습니다. `dragHandleSelector`로 지정한 핸들에서만 드래그를 허용합니다.

**Options:**
- `dragHandleSelector?: string` - 드래그 허용 요소 선택자
- `interactiveSelector?: string` - 드래그 차단할 인터랙티브 요소 선택자 (기본: `button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]`)

```svelte
<script>
  import { blockDragFromInteractive, Dnd } from '@personal/uikit';
</script>

<Dnd.Zone {items} use:blockDragFromInteractive={{ dragHandleSelector: '.drag-handle' }}>
  {#each items as item (item.id)}
    <Dnd.Row>
      <div class="drag-handle">⋮⋮</div>
      <span>{item.label}</span>
    </Dnd.Row>
  {/each}
</Dnd.Zone>
```

---

## 🎨 디자인 시스템

### 테마

Light/Dark 테마를 지원합니다.

```typescript
import { light_theme, dark_theme, theme_vars } from '@personal/uikit/design';

// 테마 변수 사용
const color = theme_vars.color.primary;
```

### 디자인 토큰

`@personal/uikit/design`에서 디자인 토큰을 export합니다:

- `theme_vars` - 테마 변수 객체
- `light_theme` - 라이트 테마
- `dark_theme` - 다크 테마

### 스타일 커스터마이징

각 컴포넌트의 스타일은 `vanilla-extract`로 작성되어 있으며, 테마 변수를 통해 커스터마이징할 수 있습니다.

---

## 🛠️ 개발

### 의존성 설치

```bash
pnpm install
```

### 개발 모드

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 타입 체크

```bash
pnpm type-check
```

### 린트 & 포맷

```bash
pnpm lint
pnpm format
```

---

## 📁 프로젝트 구조

```
src/
├── components/          # Svelte 컴포넌트
│   ├── Button/
│   ├── ButtonGroup/
│   ├── Card/
│   ├── Section/
│   ├── TextInput/
│   ├── ToggleInput/
│   ├── Select/
│   ├── Popover/
│   ├── Toast/
│   ├── CheckboxList/
│   ├── Dnd/
│   └── index.ts         # 컴포넌트 export
├── primitives/          # Headless primitive (스타일 없는 기본 구현)
│   ├── Button/
│   ├── Card/
│   ├── Section/
│   ├── TextInput/
│   ├── ToggleInput/
│   ├── Select/
│   ├── Popover/
│   ├── Toast/
│   ├── CheckboxList/
│   └── Dnd/
├── actions/             # Svelte actions
│   ├── click_outside.ts
│   ├── block_drag_from_interactive.ts
│   └── index.ts
├── design/              # 디자인 시스템
│   ├── theme/           # 테마 정의
│   │   ├── contract.css.ts  # 디자인 토큰
│   │   ├── light.css.ts     # 라이트 테마
│   │   └── dark.css.ts      # 다크 테마
│   ├── styles/          # 컴포넌트별 스타일
│   ├── types/            # 타입 정의
│   ├── global.css.ts     # 전역 스타일
│   └── index.ts          # 디자인 시스템 export
└── index.ts             # 메인 export
```

---

## 🔧 기술 스택

- **Svelte 5** - UI 프레임워크 (Runes API)
- **vanilla-extract** - 타입 안전한 CSS-in-TypeScript
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구

---

## 📦 Export 구조

### 메인 Export (`@personal/uikit`)

```typescript
// Simple 컴포넌트
export { Button, ButtonGroup, TextInput, Select } from './components';

// Compound 컴포넌트 (namespace)
export * as Card from './components/Card';
export * as Section from './components/Section';
export * as ToggleInput from './components/ToggleInput';
export * as Popover from './components/Popover';
export * as Toast from './components/Toast';
export * as CheckboxList from './components/CheckboxList';
export * as Dnd from './components/Dnd';
export type { DndEvent } from './components/Dnd';

// Actions
export { clickOutside, blockDragFromInteractive } from './actions';
export type { ClickOutsideCallback, BlockDragOptions } from './actions';

// 타입
export type { ButtonVariant, ButtonSize, SelectOption } from './design/types';
```

### 디자인 시스템 Export (`@personal/uikit/design`)

```typescript
// 테마
export { theme_vars, light_theme, dark_theme } from './theme';

// 타입
export type { ButtonVariant, ButtonSize, SelectOption } from './types';

// 전역 스타일 (import 시 자동 적용)
export {} from './global.css';
```

---

## 📝 사용 예제

### 완전한 예제

```svelte
<script>
  import { 
    Button, 
    TextInput, 
    Select,
    ButtonGroup
  } from '@personal/uikit';
  import * as Card from '@personal/uikit';
  import * as Section from '@personal/uikit';
  import * as ToggleInput from '@personal/uikit';
  import type { SelectOption } from '@personal/uikit';
  import '@personal/uikit/design'; // 전역 스타일 적용
  
  let username = '';
  let server = 'test';
  let is_text_mode = $state(false);
  let value = $state('test');
  
  const server_options: SelectOption[] = [
    { value: 'test', label: 'Test 서버' },
    { value: 'zeus01', label: 'Zeus 01' },
    { value: 'stage1', label: 'Stage 1' },
  ];
  
  function handleSubmit() {
    console.log({ username, server, is_text_mode, value });
  }
</script>

<Card.Root>
  <Card.Body>
    <Section.Root>
      <Section.Header>
        <Section.Title>설정</Section.Title>
      </Section.Header>
      <Section.Content>
        <TextInput bind:value={username} placeholder="사용자명" />
        
        <ToggleInput.Root bind:value bind:isTextMode={is_text_mode}>
          <ToggleInput.Prefix>서버</ToggleInput.Prefix>
          {#if is_text_mode}
            <TextInput bind:value />
          {:else}
            <Select bind:value options={server_options} />
          {/if}
          <ToggleInput.Toggle>{is_text_mode ? '🔽' : '✏️'}</ToggleInput.Toggle>
        </ToggleInput.Root>
        
        <ButtonGroup>
          <Button variant="primary" onclick={handleSubmit}>저장</Button>
          <Button variant="secondary">취소</Button>
        </ButtonGroup>
      </Section.Content>
    </Section.Root>
  </Card.Body>
</Card.Root>
```

---

## 🔗 관련 패키지

이 UIKit은 다음 패키지에서 사용됩니다:

- `@personal/ecount-dev-tool` - Chrome 확장프로그램 UI

---

## 📄 라이선스

MIT
