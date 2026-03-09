<!--
@component Dialog.Portal - Portals dialog content to body

Renders Overlay and Content to document.body when dialog is open.
Uses portal action to ensure modal appears above page content.
-->
<script lang="ts">
    import { getContext } from 'svelte';
    import { portal } from '../../actions';
    import type { DialogContext } from '../../primitives/Dialog/Root.svelte';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
    const ctx = getContext<DialogContext>('dialog');
</script>

{#if ctx.is_open}
    <div data-dialog-portal use:portal>
        {@render children()}
    </div>
{/if}
