# Actions

Svelte `use:` 디렉티브와 함께 사용하는 액션 함수입니다.

## clickOutside

요소 외부를 클릭하거나 Escape 키를 누를 때 콜백을 실행합니다. Popover, 드롭다운 등에서 활용됩니다.

```svelte
<script>
    import { clickOutside } from '@personal/uikit';

    let is_open = $state(false);
</script>

{#if is_open}
    <div use:clickOutside={() => (is_open = false)}>팝업 내용</div>
{/if}
```

### 타입

```typescript
type ClickOutsideCallback = () => void;

function clickOutside(node: HTMLElement, callback: ClickOutsideCallback): ActionReturn;
```

## blockDragFromInteractive

DnD 영역 내의 인터랙티브 요소(select, input, button)에서 드래그가 시작되는 것을 방지합니다.

```svelte
<script>
    import { blockDragFromInteractive } from '@personal/uikit';
</script>

<div use:blockDragFromInteractive>
    <select>...</select>
    <!-- 이 요소에서는 드래그 시작 안 됨 -->
    <span>드래그 가능</span>
</div>
```

### 타입

```typescript
interface BlockDragOptions {
    // 추가 옵션 (기본값으로 동작)
}

function blockDragFromInteractive(node: HTMLElement, options?: BlockDragOptions): ActionReturn;
```
