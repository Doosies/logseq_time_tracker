<script lang="ts">
    import { Header as PrimitiveHeader } from '../../primitives/Section';
    import { section_title_row } from '../../design/styles/section.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([section_title_row, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveHeader class={class_name}>
    {@render children()}
</PrimitiveHeader>
