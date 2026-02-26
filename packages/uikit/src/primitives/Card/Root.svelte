<script lang="ts">
    import { setContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    setContext('card', {});
</script>

<div class={extra_class} {...rest}>
    {@render children()}
</div>
