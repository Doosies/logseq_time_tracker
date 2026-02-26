<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/Section';
    import { section_container } from '../../design/styles/section.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([section_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveRoot class={class_name}>
    {@render children()}
</PrimitiveRoot>
