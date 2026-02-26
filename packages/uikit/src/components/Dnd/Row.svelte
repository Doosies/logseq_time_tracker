<!--
@component Dnd.Row - 드래그 가능한 행 래퍼

최소한의 동작/접근성 스타일만 포함 (cursor:grab, outline:none, user-select:none).
시각적 스타일은 class prop으로 외부에서 주입합니다.
HTML div attributes를 restProps로 전달할 수 있습니다.

@example
```svelte
<Dnd.Row class="my-item" role="option" aria-label="드래그 가능한 항목">
    <span>Item content</span>
</Dnd.Row>
```
-->
<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extraClass, ...restProps }: Props = $props();
</script>

<div class="dnd-row {extraClass ?? ''}" {...restProps}>
    {@render children()}
</div>

<style>
    .dnd-row {
        outline: none;
        user-select: none;
    }
</style>
