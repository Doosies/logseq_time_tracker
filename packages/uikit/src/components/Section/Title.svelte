<script lang="ts">
    import { Title as PrimitiveTitle } from '../../primitives/Section';
    import { section_title } from '../../design/styles/section.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([section_title, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveTitle class={class_name}>
    {@render children()}
</PrimitiveTitle>
