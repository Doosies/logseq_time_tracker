<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/Popover';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<PrimitiveRoot class={extra_class}>
    {@render children()}
</PrimitiveRoot>
