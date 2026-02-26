<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/Card';
    import { card_container } from '../../design/styles/card.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([card_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveRoot class={class_name}>
    {@render children()}
</PrimitiveRoot>
