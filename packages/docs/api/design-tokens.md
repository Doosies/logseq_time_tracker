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

## Transition 토큰

애니메이션 및 전환 효과 지속 시간입니다.

| 토큰 | CSS 변수 | Light/Dark | 용도 |
|------|----------|------------|------|
| `theme_vars.transition.fast` | `--transition-fast` | 0.1s ease | 버튼 hover, 작은 UI 피드백 |
| `theme_vars.transition.normal` | `--transition-normal` | 0.15s ease | 일반적인 전환 |
| `theme_vars.transition.slow` | `--transition-slow` | 0.3s ease | 모달 열기/닫기, 복잡한 애니메이션 |

## Z-index 토큰

레이어 순서 제어용 z-index 값입니다.

| 토큰 | CSS 변수 | 값 | 용도 |
|------|----------|-----|------|
| `theme_vars.z_index.base` | `--z-index-base` | 1 | 기본 오버레이 |
| `theme_vars.z_index.above` | `--z-index-above` | 2 | 일반 콘텐츠 위 요소 |
| `theme_vars.z_index.popover` | `--z-index-popover` | 10 | 팝오버, 드롭다운, 모달 |

## Shadow 토큰

그림자 효과입니다. Light/Dark 테마별로 opacity가 다릅니다.

| 토큰 | CSS 변수 | Light | Dark |
|------|----------|-------|------|
| `theme_vars.shadow.sm` | `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | `0 1px 3px rgba(0,0,0,0.2)` |
| `theme_vars.shadow.md` | `--shadow-md` | `0 4px 12px rgba(0,0,0,0.12)` | `0 4px 12px rgba(0,0,0,0.3)` |
| `theme_vars.shadow.lg` | `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.16)` | `0 8px 24px rgba(0,0,0,0.4)` |

Dark 테마는 밝은 배경 대비 가시성을 위해 rgba opacity를 더 높게 설정합니다.

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
