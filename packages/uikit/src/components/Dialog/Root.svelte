<!--
@component Dialog.Root - Dialog container

Manages open/close state via context. Re-exports primitive Root.
-->
<script lang="ts">
    import PrimitiveRoot from '../../primitives/Dialog/Root.svelte';
    import type { Snippet } from 'svelte';

    interface Props {
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        children: Snippet;
        class?: string;
    }

    let { open = $bindable(false), onOpenChange, children, class: extra_class }: Props = $props();
</script>

<PrimitiveRoot
    bind:open
    {...onOpenChange ? { onOpenChange } : {}}
    {...extra_class != null ? { class: extra_class } : {}}
>
    {@render children()}
</PrimitiveRoot>
