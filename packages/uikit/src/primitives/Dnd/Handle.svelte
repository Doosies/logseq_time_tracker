<script lang="ts">
    import { dragHandle } from 'svelte-dnd-action';
    import type { Snippet } from 'svelte';

    interface Props {
        label?: string;
        children?: Snippet;
        class?: string;
    }

    let { label = '드래그하여 순서 변경', children, class: extra_class }: Props = $props();
</script>

<span class={extra_class} data-drag-handle use:dragHandle aria-label={label}>
    {#if children}
        {@render children()}
    {:else}
        ⠿
    {/if}
</span>
