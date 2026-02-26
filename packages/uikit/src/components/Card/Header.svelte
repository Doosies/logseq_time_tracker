<script lang="ts">
    import { Header as PrimitiveHeader } from '../../primitives/Card';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<PrimitiveHeader class={extra_class}>
    {@render children()}
</PrimitiveHeader>
