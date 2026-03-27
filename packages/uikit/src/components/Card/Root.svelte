<script lang="ts">
    import { setContext } from 'svelte';
    import { card_container } from '../../design/styles/card.css';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const class_name = $derived([card_container, extra_class].filter(Boolean).join(' '));
    setContext('card', {});
</script>

<div class={class_name} {...rest}>
    {@render children()}
</div>
