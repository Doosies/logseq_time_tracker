---
name: svelte-conventions
description: Svelte 프로젝트 네이밍 컨벤션 및 코딩 가이드 (uikit, ecount-dev-tool)
---

# Svelte 프로젝트 네이밍 컨벤션

## 개요

이 Skill은 Svelte 프로젝트(uikit, ecount-dev-tool) 전용 네이밍 규칙을 정의합니다. AGENTS.md의 공통 규칙과 달리, **Svelte 컴포넌트 내부는 TypeScript/Svelte 생태계 표준인 camelCase를 사용**하며, 일반 `.ts` 파일의 snake_case 규칙과 구분됩니다.

## 핵심 원칙

- **Svelte 컴포넌트 내부**: camelCase 사용 (TypeScript/Svelte 생태계 표준)
- **일반 .ts 파일**: AGENTS.md 규칙 준수 (변수 snake_case, 함수 camelCase)
- **CSS/스타일 파일**: snake_case 유지 (Vanilla Extract 클래스명 등)

## 파일/폴더 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | `PascalCase.svelte` | `Button.svelte`, `ToggleInput.svelte` |
| 컴포넌트 폴더 | `PascalCase/` (컴포넌트명과 동일) | `Button/`, `Select/` |
| 폴더 구조 | `ComponentName/ComponentName.svelte` + `index.ts` | `Button/Button.svelte`, `Button/index.ts` |
| 스타일 파일 | `snake_case.css.ts` | `toggle_input.css.ts`, `button.css.ts` |
| 스토어 파일 (Runes) | `snake_case.svelte.ts` | `current_tab.svelte.ts` |
| 서비스 파일 | `snake_case.ts` | `url_service.ts` |
| 타입 파일 | `snake_case.ts` | `design/types.ts` |

## 컴포넌트 내부 네이밍 (camelCase 예외 구역)

Svelte 컴포넌트 `.svelte` 파일 내부에서는 camelCase를 사용합니다.

### Props 인터페이스

- 인터페이스명: `PascalCase` + `Props` suffix
- Props 속성: `camelCase`

```typescript
interface ButtonProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  children: Snippet;
}
```

### 이벤트 Props

- **DOM 이벤트 Props**: 소문자 (Svelte 5 표준)
  - `onclick`, `onchange`, `oninput`, `onkeydown`, `onblur`, `onfocus` 등
- **커스텀 이벤트 Props**: `on` + PascalCase
  - `onToggle`, `onSelect`, `onClose` 등
  - DOM 이벤트와 구분하여 커스텀 콜백임을 명시

```typescript
interface ToggleInputProps {
  value?: string;
  onToggle?: () => void;   // 커스텀: camelCase
  onchange?: (value: string) => void;  // DOM 이벤트: 소문자
}
```

### 변수 및 함수

- 로컬 변수: `camelCase`
- `$state` / `$derived` 변수: `camelCase`
- 함수명: `camelCase`
- 이벤트 핸들러: `handle` + PascalCase (예: `handleClick`, `handleInput`)
- 클래스 생성 함수: `get` + PascalCase (예: `getClassNames`)

```typescript
let { variant, fullWidth, onclick }: ButtonProps = $props();

const getClassNames = () => {
  const classes = [styles.button_variant[variant]];
  if (fullWidth) classes.push(styles.button_full_width);
  return classes.join(' ');
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  onchange?.(target.value);
};
```

## CSS/스타일 네이밍 (snake_case 유지)

Vanilla Extract 및 스타일 관련 파일에서는 snake_case를 유지합니다.

- Vanilla Extract 클래스명: `snake_case`
- 테마 변수: `snake_case`

```typescript
// button.css.ts
export const button_variant = styleVariants({ ... });
export const button_full_width = style({ ... });

// contract.css.ts
export const theme_vars = createThemeContract({
  color: {
    primary: '',
    primary_hover: '',
  },
});
```

### 디자인 토큰 의미적 용도 (필수)

테마 토큰(theme_vars.color.* 등)은 **의미적 용도(semantic purpose)**를 고려하여 사용합니다:

| 토큰 | 의도된 용도 | 주의 |
|------|-------------|------|
| `color.background` | 페이지/컨테이너 배경 (라이트: 밝은색, 다크: 어두운색) | 버튼 텍스트 등에 사용 금지 (다크 모드에서 가독성 저하) |
| `color.text` | 본문 텍스트 (배경과 대비되는 색) | 버튼 텍스트에 사용 가능 |
| `color.primary` | 강조/CTA 요소 | 버튼 배경, 링크 등 |

**맥락에 맞는 토큰 선택**:
- 버튼 텍스트: `color.text` 또는 `color.primary` 사용. `color.background`는 사용 금지
- 하드코딩(`#ffffff` 등)을 토큰으로 교체 시: 다크 테마에서 가독성 저하되면 교체하지 않음

## 일반 .ts 파일 네이밍 (snake_case 유지)

컴포넌트 외부의 일반 `.ts` 파일은 AGENTS.md 규칙을 따릅니다.

- 변수명: `snake_case`
- 함수명: `camelCase`
- 상수: `UPPER_SNAKE_CASE`
- 인터페이스/타입 속성: `snake_case` 권장 (단, DOM 속성 참조 시 camelCase 허용)

```typescript
// url_service.ts
const base_url = 'https://api.example.com';

function buildUrl(path: string): string {
  return `${base_url}${path}`;
}
```

## 좋은 예 / 나쁜 예

### 컴포넌트 Props

```typescript
// ✅ 좋은 예
interface ButtonProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  onclick?: () => void;
  children: Snippet;
}

// ❌ 나쁜 예 (AGENTS.md 변수 규칙을 컴포넌트에 적용)
interface ButtonProps {
  full_width?: boolean;  // 컴포넌트 내부는 camelCase
  on_click?: () => void;
}
```

### 이벤트 Props 혼용

```typescript
// ✅ 좋은 예 - DOM vs 커스텀 구분
interface ToggleInputProps {
  onchange?: (value: string) => void;  // DOM: 소문자
  onToggle?: () => void;                // 커스텀: camelCase
}

// ❌ 나쁜 예 - 일관성 없음
interface ToggleInputProps {
  onChange?: (value: string) => void;  // DOM 이벤트는 소문자 권장
  ontoggle?: () => void;              // 커스텀은 onToggle
}
```

### 컴포넌트 내부 함수

```typescript
// ✅ 좋은 예
const getClassNames = () => { ... };
const handleInput = (e: Event) => { ... };

// ❌ 나쁜 예
const get_class_names = () => { ... };  // 컴포넌트 내부는 camelCase
const handle_input = (e: Event) => { ... };
```

### 스타일 클래스 참조

```typescript
// ✅ 좋은 예 - styles는 snake_case (Vanilla Extract)
class={styles.button_container}
class={styles.toggle_input_container}

// ❌ 나쁜 예
class={styles.buttonContainer}  // .css.ts 파일은 snake_case
```

## AGENTS.md와의 차이점

| 구분 | AGENTS.md (공통) | Svelte 컴포넌트 내부 |
|------|------------------|----------------------|
| 변수명 | snake_case | camelCase |
| Props 속성 | - | camelCase |
| DOM 이벤트 Props | - | 소문자 (onclick, onchange) |
| 커스텀 이벤트 Props | - | onToggle, onSelect |
| 함수명 | camelCase | camelCase (동일) |
| 클래스명 | PascalCase | PascalCase (동일) |
| CSS/스타일 | - | snake_case 유지 |

## 체크리스트

Svelte 컴포넌트 작성 시 확인할 항목:

- [ ] 컴포넌트 파일명: `PascalCase.svelte`
- [ ] 폴더 구조: `ComponentName/ComponentName.svelte` + `index.ts`
- [ ] Props 인터페이스: `XxxProps` 명명, 속성 camelCase
- [ ] DOM 이벤트 Props: 소문자 (`onclick`, `onchange` 등)
- [ ] 커스텀 이벤트 Props: `on` + PascalCase (`onToggle`, `onSelect`)
- [ ] 컴포넌트 내부 변수/함수: camelCase
- [ ] 이벤트 핸들러: `handle` + PascalCase
- [ ] Vanilla Extract 클래스: snake_case (`button_container` 등)
- [ ] 일반 .ts 파일: AGENTS.md 규칙 준수 (변수 snake_case)
