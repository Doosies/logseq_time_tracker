<script lang="ts">
    import { setContext } from 'svelte';
    import { section_container } from '../../design/styles/section.css';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLElement> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const class_name = $derived([section_container, extra_class].filter(Boolean).join(' '));
    setContext('section', {});
</script>

<section class={class_name} {...rest}>
    {@render children()}
</section>
