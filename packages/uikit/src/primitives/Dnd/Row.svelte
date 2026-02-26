<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extraClass, ...restProps }: Props = $props();
</script>

<div class={extraClass} {...restProps}>
    {@render children()}
</div>
