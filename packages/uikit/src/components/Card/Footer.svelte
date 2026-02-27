<script lang="ts">
    import { Footer as PrimitiveFooter } from '../../primitives/Card';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<PrimitiveFooter class={extra_class ?? ''}>
    {@render children()}
</PrimitiveFooter>
