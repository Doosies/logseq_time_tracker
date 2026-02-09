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

<Card>
  <TextInput placeholder="이름을 입력하세요" />
  <Button variant="primary" onclick={() => console.log('클릭!')}>
    제출
  </Button>
</Card>
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

### Card

카드 컨테이너 컴포넌트입니다.

**예제:**
```svelte
<script>
  import { Card } from '@personal/uikit';
</script>

<Card>
  <h2>카드 제목</h2>
  <p>카드 내용입니다.</p>
</Card>
```

### Section

섹션 레이아웃 컴포넌트입니다.

**예제:**
```svelte
<script>
  import { Section } from '@personal/uikit';
</script>

<Section>
  <h2>섹션 제목</h2>
  <p>섹션 내용입니다.</p>
</Section>
```

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

### ToggleInput

토글 스위치 컴포넌트입니다.

**Props:**
- `value?: boolean` - 토글 상태 (양방향 바인딩)
- `disabled?: boolean` - 비활성화 여부 (기본값: `false`)
- `onchange?: (value: boolean) => void` - 변경 핸들러

**예제:**
```svelte
<script>
  import { ToggleInput } from '@personal/uikit';
  
  let enabled = false;
</script>

<ToggleInput 
  bind:value={enabled}
  onchange={(value) => console.log('토글:', value)}
/>
```

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
│   └── index.ts        # 컴포넌트 export
├── design/             # 디자인 시스템
│   ├── theme/          # 테마 정의
│   │   ├── contract.css.ts  # 디자인 토큰
│   │   ├── light.css.ts     # 라이트 테마
│   │   └── dark.css.ts      # 다크 테마
│   ├── styles/         # 컴포넌트별 스타일
│   │   ├── button.css.ts
│   │   ├── button_group.css.ts
│   │   ├── card.css.ts
│   │   ├── section.css.ts
│   │   ├── text_input.css.ts
│   │   ├── toggle_input.css.ts
│   │   └── select.css.ts
│   ├── types/          # 타입 정의
│   ├── global.css.ts   # 전역 스타일
│   └── index.ts        # 디자인 시스템 export
└── index.ts            # 메인 export
```

## 🔧 기술 스택

- **Svelte 5** - UI 프레임워크 (Runes API)
- **vanilla-extract** - 타입 안전한 CSS-in-TypeScript
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구

## 📦 Export 구조

### 컴포넌트 Export (`@personal/uikit`)

```typescript
// 모든 컴포넌트
export { Button, ButtonGroup, Card, Section, TextInput, ToggleInput, Select } from './components';

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

## 📝 사용 예제

### 완전한 예제

```svelte
<script>
  import { 
    Button, 
    Card, 
    Section, 
    TextInput, 
    Select,
    ToggleInput 
  } from '@personal/uikit';
  import type { SelectOption } from '@personal/uikit';
  import '@personal/uikit/design'; // 전역 스타일 적용
  
  let username = '';
  let server = 'test';
  let enabled = false;
  
  const serverOptions: SelectOption[] = [
    { value: 'test', label: 'Test 서버' },
    { value: 'zeus01', label: 'Zeus 01' },
    { value: 'stage1', label: 'Stage 1' },
  ];
  
  function handleSubmit() {
    console.log({ username, server, enabled });
  }
</script>

<Card>
  <Section>
    <h2>설정</h2>
    
    <TextInput 
      bind:value={username}
      placeholder="사용자명"
    />
    
    <Select 
      bind:value={server}
      options={serverOptions}
    />
    
    <ToggleInput 
      bind:value={enabled}
    />
    
    <Button variant="primary" onclick={handleSubmit}>
      저장
    </Button>
  </Section>
</Card>
```

## 🔗 관련 패키지

이 UIKit은 다음 패키지에서 사용됩니다:

- `@personal/ecount-dev-tool` - Chrome 확장프로그램 UI

## 📄 라이선스

MIT
