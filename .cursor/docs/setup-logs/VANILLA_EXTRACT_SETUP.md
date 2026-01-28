# VANILLA_EXTRACT_SETUP_COMPLETE.md

## ✅ Vanilla Extract 적용 완료!

### 📦 설치된 패키지

- `@vanilla-extract/css` ^1.16.2 - 핵심 라이브러리
- `@vanilla-extract/vite-plugin` ^5.1.4 - Vite 플러그인

### 🎨 생성된 파일

#### 1. **theme.css.ts** - 테마 시스템
```typescript
- theme_vars: 테마 변수 계약
- light_theme: 라이트 테마
- dark_theme: 다크 테마 (준비됨)
```

**테마 변수:**
- color (primary, text, background 등)
- space (간격)
- font (크기, 굵기, 폰트 패밀리)
- radius (border radius)

#### 2. **global.css.ts** - 글로벌 스타일
```typescript
- 글로벌 리셋
- 기본 스타일
- 테마 변수 적용
```

#### 3. **App.css.ts** - 컴포넌트 스타일
```typescript
- container, title, counter_section
- count_text, button_group, button
- 테마 변수 사용
- hover, active, disabled 상태
```

### 🔧 Vite 설정 업데이트

```typescript
plugins: [
  logseqDevPlugin(),
  vanillaExtractPlugin(), // ✅ 추가됨
  react()
]
```

### 💡 주요 특징

#### 1. **제로 런타임**
```typescript
// 빌드 타임에 정적 CSS 생성
// 런타임 오버헤드 없음
import * as styles from "./App.css";
<div className={styles.container} />
```

#### 2. **타입 안전성**
```typescript
// TypeScript 자동완성 지원
import { theme_vars } from "./theme.css";
backgroundColor: theme_vars.color.primary // ✅ 타입 체크
```

#### 3. **로컬 스코프**
```typescript
// 자동으로 고유한 클래스명 생성
export const button = style({ ... });
// 결과: .App_button__1a2b3c
```

#### 4. **테마 시스템**
```typescript
// CSS 변수 기반
export const theme_vars = createThemeContract({ ... });
export const light_theme = createTheme(theme_vars, { ... });
```

### 🎯 사용 예제

#### 기본 스타일
```typescript
// Button.css.ts
import { style } from "@vanilla-extract/css";

export const button = style({
  padding: "10px 20px",
  backgroundColor: "blue",
  ":hover": { backgroundColor: "darkblue" }
});
```

#### 테마 사용
```typescript
// Button.css.ts
import { theme_vars } from "./theme.css";

export const button = style({
  backgroundColor: theme_vars.color.primary,
  padding: theme_vars.space.medium
});
```

#### 컴포넌트
```tsx
// Button.tsx
import * as styles from "./Button.css";

export const Button = () => (
  <button className={styles.button}>Click</button>
);
```

### 📚 고급 기능

#### 1. **스타일 변형 (Variants)**
```typescript
import { styleVariants } from "@vanilla-extract/css";

export const button = styleVariants({
  primary: { backgroundColor: "blue" },
  secondary: { backgroundColor: "gray" }
});

<button className={button.primary} />
```

#### 2. **레시피 (Recipes)**
```typescript
import { recipe } from "@vanilla-extract/recipes";

export const button = recipe({
  base: { padding: "10px" },
  variants: {
    color: {
      primary: { backgroundColor: "blue" },
      secondary: { backgroundColor: "gray" }
    },
    size: {
      small: { padding: "5px" },
      large: { padding: "15px" }
    }
  }
});

<button className={button({ color: "primary", size: "large" })} />
```

#### 3. **복잡한 선택자**
```typescript
export const container = style({
  selectors: {
    "&:not(:last-child)": {
      marginBottom: "10px"
    },
    "&:hover > &": {
      opacity: 0.8
    }
  }
});
```

### 🚀 다음 단계

#### 1. 테마 전환 구현
```tsx
const [theme, setTheme] = useState<"light" | "dark">("light");
<div className={theme === "light" ? light_theme : dark_theme}>
  {/* 콘텐츠 */}
</div>
```

#### 2. 공통 스타일 라이브러리
```
src/
├── styles/
│   ├── theme.css.ts
│   ├── global.css.ts
│   ├── common.css.ts    # 공통 스타일
│   └── utils.css.ts     # 유틸리티 스타일
```

#### 3. 컴포넌트 스타일 분리
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.css.ts
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── Card.css.ts
```

### 📖 문서

자세한 가이드는 [Vanilla Extract 가이드](packages/docs/guide/vanilla-extract.md)를 참조하세요.

### 🎉 완료!

이제 타입 안전하고 성능 좋은 CSS를 작성할 수 있습니다!

```bash
pnpm dev  # 개발 서버 실행
pnpm build  # 빌드 확인
```

### 🔗 참고 자료

- [Vanilla Extract 공식 문서](https://vanilla-extract.style/)
- [API 레퍼런스](https://vanilla-extract.style/documentation/api/)
- [Vite 플러그인](https://vanilla-extract.style/documentation/integrations/vite/)
