<!--
@component Dialog.Overlay - Semi-transparent backdrop

Covers the viewport. Click to close (when closeOnOverlayClick is true).
-->
<script lang="ts">
    import { Overlay as PrimitiveOverlay } from '../../primitives/Dialog';
    import { dialog_overlay } from '../../design/styles/dialog.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children?: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([dialog_overlay, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveOverlay class={class_name}>
    {#if children}
        {@render children()}
    {/if}
</PrimitiveOverlay>
