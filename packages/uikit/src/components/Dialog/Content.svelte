<!--
@component Dialog.Content - Centered dialog panel

Modal content container with focus trap.
-->
<script lang="ts">
    import { Content as PrimitiveContent } from '../../primitives/Dialog';
    import { dialog_content } from '../../design/styles/dialog.css';
    import type { Snippet } from 'svelte';

    interface Props {
        closeOnEscape?: boolean;
        closeOnOverlayClick?: boolean;
        children: Snippet;
        class?: string;
    }

    let { closeOnEscape = true, closeOnOverlayClick = true, children, class: extra_class }: Props = $props();
    const class_name = $derived([dialog_content, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveContent {closeOnEscape} {closeOnOverlayClick} class={class_name}>
    {@render children()}
</PrimitiveContent>
