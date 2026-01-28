# Vanilla Extract 가이드

## 소개

이 프로젝트는 [vanilla-extract](https://vanilla-extract.style/)를 사용하여 CSS를 작성합니다.

## 특징

- ✅ **제로 런타임**: 빌드 타임에 정적 CSS 생성
- ✅ **타입 안전성**: TypeScript로 작성된 스타일
- ✅ **로컬 스코프**: CSS Modules처럼 자동으로 클래스명 스코핑
- ✅ **테마 시스템**: CSS 변수 기반 테마
- ✅ **작은 번들 크기**: 런타임 오버헤드 없음

## 기본 사용법

### 스타일 파일 생성

`.css.ts` 확장자로 스타일 파일을 생성합니다:

```ts
// Button.css.ts
import { style } from '@vanilla-extract/css';

export const button = style({
    padding: '10px 20px',
    backgroundColor: 'blue',
    color: 'white',
    borderRadius: '5px',

    ':hover': {
        backgroundColor: 'darkblue',
    },
});
```

### 컴포넌트에서 사용

```tsx
// Button.tsx
import * as styles from './Button.css';

export const Button = () => {
    return <button className={styles.button}>Click me</button>;
};
```

## 테마 시스템

### 테마 변수 사용

```ts
// theme.css.ts
import { createTheme, createThemeContract } from '@vanilla-extract/css';

export const theme_vars = createThemeContract({
    color: {
        primary: null,
        text: null,
    },
});

export const light_theme = createTheme(theme_vars, {
    color: {
        primary: '#007bff',
        text: '#2c3e50',
    },
});
```

### 스타일에서 테마 사용

```ts
// Button.css.ts
import { style } from '@vanilla-extract/css';
import { theme_vars } from './theme.css';

export const button = style({
    backgroundColor: theme_vars.color.primary,
    color: 'white',
});
```

### 컴포넌트에서 테마 적용

```tsx
import { light_theme } from './theme.css';

<div className={light_theme}>
    <Button />
</div>;
```

## 글로벌 스타일

```ts
// global.css.ts
import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
});
```

컴포넌트에서 import:

```tsx
import './global.css';
```

## 고급 기능

### 복잡한 선택자

```ts
export const container = style({
    selectors: {
        '&:not(:last-child)': {
            marginBottom: '10px',
        },
    },
});
```

### 조건부 스타일

```ts
import { styleVariants } from "@vanilla-extract/css";

export const button = styleVariants({
  primary: { backgroundColor: "blue" },
  secondary: { backgroundColor: "gray" },
});

// 사용
<button className={button.primary}>Primary</button>;
```

### 레시피 (동적 variants)

```ts
import { recipe } from "@vanilla-extract/recipes";

export const button = recipe({
  base: {
    padding: "10px",
    borderRadius: "5px",
  },
  variants: {
    color: {
      primary: { backgroundColor: "blue" },
      secondary: { backgroundColor: "gray" },
    },
    size: {
      small: { padding: "5px" },
      large: { padding: "15px" },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "small",
  },
});

// 사용
<button className={button({ color: "primary", size: "large" })}>
  Large Primary Button
</button>;
```

## 프로젝트 구조

```
src/
├── theme.css.ts         # 테마 정의
├── global.css.ts        # 글로벌 스타일
├── App.css.ts          # App 컴포넌트 스타일
└── App.tsx             # App 컴포넌트
```

## 모범 사례

1. **테마 변수 사용**: 하드코딩된 값 대신 테마 변수 사용
2. **파일 분리**: 컴포넌트와 스타일을 같은 디렉토리에 배치
3. **네이밍**: snake_case 사용 (프로젝트 컨벤션)
4. **재사용**: 공통 스타일은 별도 파일로 분리

## 참고 자료

- [vanilla-extract 공식 문서](https://vanilla-extract.style/)
- [API 레퍼런스](https://vanilla-extract.style/documentation/api/)
- [예제](https://github.com/vanilla-extract-css/vanilla-extract/tree/master/examples)
