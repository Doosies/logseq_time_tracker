<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        class?: string | undefined;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
</script>

<div class={extra_class} role="group" {...rest}>
    {@render children()}
</div>
