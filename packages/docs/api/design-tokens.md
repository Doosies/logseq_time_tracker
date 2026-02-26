# Design Tokens

UIKit의 디자인 시스템은 vanilla-extract 기반의 타입 안전한 디자인 토큰을 제공합니다.

## Import

```typescript
import { theme_vars, light_theme, dark_theme } from '@personal/uikit/design';
import type { ButtonVariant, ButtonSize, SelectOption } from '@personal/uikit';
```

## 테마 변수 (theme_vars)

`theme_vars`는 CSS 커스텀 프로퍼티에 대한 타입 안전한 참조입니다.

```typescript
// 사용 예
const styles = {
  color: theme_vars.color.primary,
  background: theme_vars.color.surface,
  borderRadius: theme_vars.radius.md,
};
```

## Light / Dark 테마

```svelte
<script>
  import '@personal/uikit/design';
</script>

<!-- light_theme 클래스가 자동 적용됩니다 -->
<!-- 다크 모드는 dark_theme 클래스를 루트에 추가 -->
```

## WCAG AA 접근성

모든 테마 색상은 WCAG AA 기준(대비율 4.5:1 이상)을 준수합니다.

## 타입

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'accent';
type ButtonSize = 'sm' | 'md';

interface SelectOption {
  value: string;
  label: string;
}
```
