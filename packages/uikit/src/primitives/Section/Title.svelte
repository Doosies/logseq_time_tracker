<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<div
    class={extra_class}
    data-drag-handle
    data-section-header
    role="button"
    tabindex="0"
    aria-label="드래그하여 섹션 순서 변경"
>
    {@render children()}
</div>
