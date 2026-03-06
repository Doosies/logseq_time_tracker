<script lang="ts">
    import { setContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLElement> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    setContext('section', {});
</script>

<section class={extra_class} {...rest}>
    {@render children()}
</section>
