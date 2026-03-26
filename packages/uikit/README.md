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

Button, ButtonGroup, TextInput, Textarea, Select, Tooltip, LayoutSwitcher, DatePicker, TimeRangePicker, PromptDialog, ElapsedTimer는 단일 export로 사용합니다.

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

### Tooltip

호버 시 추가 정보를 표시하는 툴팁 컴포넌트입니다.

**기본 사용법**

```svelte
<script>
  import { Tooltip, Button } from '@personal/uikit';
</script>

<Tooltip content="도움말 텍스트">
  <Button>버튼</Button>
</Tooltip>
```

**Props**

| Prop | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `content` | `string` | - | 툴팁에 표시될 텍스트 (필수) |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 툴팁 위치 (viewport 경계 시 자동 조정) |
| `disabled` | `boolean` | `false` | 툴팁 비활성화 여부 |
| `delay` | `number` | `0` | 툴팁 표시 지연 시간 (ms) |
| `children` | `Snippet` | - | 트리거 요소 (필수) |

**사용 예시**

```svelte
<!-- 위치 지정 -->
<Tooltip content="아래에 표시" position="bottom">
  <Button>하단 툴팁</Button>
</Tooltip>

<!-- 비활성화 -->
<Tooltip content="표시 안 됨" disabled>
  <Button>툴팁 없음</Button>
</Tooltip>

<!-- 지연 시간 -->
<Tooltip content="0.5초 후 표시" delay={500}>
  <Button>지연 툴팁</Button>
</Tooltip>
```

**접근성**

- `role="tooltip"` 자동 적용
- `aria-describedby`로 트리거와 연결
- 호버 전용 (키보드는 트리거의 `aria-label` 사용)

**주의사항**

- `content`는 일반 텍스트로 렌더링됨 (HTML 미지원)
- 툴팁은 `document.body`에 Portal로 렌더링됨

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

드래그앤드롭으로 순서 변경이 가능한 체크박스 리스트입니다. 내부적으로 `Dnd.Provider`를 사용합니다.

| Sub-component | 용도 |
|---------------|------|
| `CheckboxList.Root` | 리스트 컨테이너 (필수) |
| `CheckboxList.Item` | 체크박스 항목 |

**Props:**
- `CheckboxList.Root`: `items: T[]` (T extends `{ id: string | number }`), `onreorder?: (new_items: T[]) => void`, `item` (항목용 스니펫), `class?: string`
- `CheckboxList.Item`: `checked`, `disabled`, `ontoggle`, `handleAttach?` (Root의 `item` 스니펫에서 전달), `children`, `class?: string` 및 기타 HTML div 속성

**`item` 스니펫 인자:** `{ item: T; index: number; handleAttach: unknown }` — `handleAttach`를 `CheckboxList.Item`에 넘겨 드래그 핸들을 연결합니다.

**예제:**
```svelte
<script>
  import * as CheckboxList from '@personal/uikit';

  let items = $state([
    { id: 'a', label: 'Item A', visible: true },
    { id: 'b', label: 'Item B', visible: false },
  ]);

  function handleReorder(new_items: typeof items) {
    items = new_items;
  }
  function toggle(id: string) {
    items = items.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i));
  }
</script>

<CheckboxList.Root {items} onreorder={handleReorder}>
  {#snippet item({ item, index, handleAttach })}
    <CheckboxList.Item
      {handleAttach}
      checked={item.visible}
      ontoggle={() => toggle(item.id)}
    >
      {item.label}
    </CheckboxList.Item>
  {/snippet}
</CheckboxList.Root>
```

---

### Dnd (Compound)

`@dnd-kit/svelte` 기반 드래그앤드롭입니다. 목록 컨테이너는 `Dnd.Provider`, 각 행은 `Dnd.Sortable`로 구성합니다.

| Sub-component | 용도 |
|---------------|------|
| `Dnd.Provider` | 드롭 컨텍스트·센서 (필수) |
| `Dnd.Sortable` | 단일 드래그 가능 항목 (`id` / `index`로 식별) |

**Props:**
- `Dnd.Provider`: `items: T[]` (T extends `{ id: string | number }`), `onreorder?: (new_items: T[]) => void`, `children`, `class?: string`, `activation_distance?: number` (포인터 활성화 최소 이동 거리(px); 지정 시 거리 기반 PointerSensor 사용)
- `Dnd.Sortable`: `id`, `index`, `children` — `children`은 스니펫이며 인자로 `{ handleAttach }`를 받습니다. `handleAttach`는 핸들 요소에 `{@attach handleAttach}`로 연결합니다.

**예제:**
```svelte
<script>
  import * as Dnd from '@personal/uikit';

  let items = $state([
    { id: '1', label: 'Row 1' },
    { id: '2', label: 'Row 2' },
    { id: '3', label: 'Row 3' },
  ]);

  function handleReorder(new_items: typeof items) {
    items = new_items;
  }
</script>

<Dnd.Provider {items} onreorder={handleReorder}>
  {#each items as item, index (item.id)}
    <Dnd.Sortable id={item.id} {index}>
      {#snippet children({ handleAttach })}
        <div style="display: flex; align-items: center; gap: 0.5em;">
          <span data-drag-handle aria-label="드래그하여 순서 변경" {@attach handleAttach}>⠿</span>
          <span>{item.label}</span>
        </div>
      {/snippet}
    </Dnd.Sortable>
  {/each}
</Dnd.Provider>
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

DnD 영역에서 버튼, input 등 인터랙티브 요소에서 드래그가 시작되지 않도록 막습니다. `dragHandleSelector`로 지정한 핸들에서만 드래그를 허용합니다. `Dnd.Provider` 루트에 직접 `use:`를 붙일 수 없으므로, 감싸는 요소에 액션을 적용합니다.

**Options:**
- `dragHandleSelector?: string` - 드래그 허용 요소 선택자
- `interactiveSelector?: string` - 드래그 차단할 인터랙티브 요소 선택자 (기본: `button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]`)

```svelte
<script>
  import { blockDragFromInteractive } from '@personal/uikit';
  import * as Dnd from '@personal/uikit';

  let items = $state([
    { id: '1', label: 'Row 1' },
    { id: '2', label: 'Row 2' },
  ]);

  function handleReorder(new_items: typeof items) {
    items = new_items;
  }
</script>

<div use:blockDragFromInteractive={{ dragHandleSelector: '.drag-handle' }}>
  <Dnd.Provider {items} onreorder={handleReorder}>
    {#each items as item, index (item.id)}
      <Dnd.Sortable id={item.id} {index}>
        {#snippet children({ handleAttach })}
          <div style="display: flex; align-items: center; gap: 0.5em;">
            <span class="drag-handle" aria-label="드래그" {@attach handleAttach}>⋮⋮</span>
            <button type="button">편집</button>
            <span>{item.label}</span>
          </div>
        {/snippet}
      </Dnd.Sortable>
    {/each}
  </Dnd.Provider>
</div>
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
│   ├── Tooltip/
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
│   ├── Tooltip/
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

### 메인 진입점 (`src/index.ts` → `@personal/uikit`)

```typescript
export * from './components';
export * from './actions';
export type {
  ButtonVariant,
  ButtonSize,
  SelectOption,
  TooltipPosition,
  LayoutMode,
  ToastLevel,
} from './design/types';
```

### 컴포넌트 배럴 (`src/components/index.ts`)

```typescript
export { LayoutSwitcher } from '../primitives/LayoutSwitcher';
export { Button } from './Button';
export { Select } from './Select';
export { TextInput } from './TextInput';
export { Textarea } from './Textarea';
export * as ToggleInput from './ToggleInput';
export * as Section from './Section';
export { ButtonGroup } from './ButtonGroup';
export { Tooltip } from './Tooltip';
export * as Card from './Card';
export * as Dnd from './Dnd';
export * as Popover from './Popover';
export * as Toast from './Toast';
export * as CheckboxList from './CheckboxList';
export { DatePicker } from './DatePicker';
export { TimeRangePicker } from './TimeRangePicker';
export { PromptDialog } from './PromptDialog';
export { ElapsedTimer } from './ElapsedTimer';
```

### Actions (`src/actions/index.ts` 경유)

`clickOutside`, `blockDragFromInteractive`, `focusTrap` 및 관련 타입이 `export * from './actions'`로 함께 노출됩니다.

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
