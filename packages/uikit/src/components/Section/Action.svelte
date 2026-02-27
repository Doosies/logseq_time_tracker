<script lang="ts">
    import { Action as PrimitiveAction } from '../../primitives/Section';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<PrimitiveAction class={extra_class ?? ''}>
    {@render children()}
</PrimitiveAction>
