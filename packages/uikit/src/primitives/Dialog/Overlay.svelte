<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';

    import type { DialogContext } from './Root.svelte';

    interface Props {
        children?: Snippet;
        class?: string;
    }

    let { children, class: extraClass }: Props = $props();
    const ctx = getContext<DialogContext>('dialog');

    function handleClick(): void {
        if (ctx.content_options.closeOnOverlayClick !== false) {
            ctx.close();
        }
    }
</script>

<div class={extraClass} onclick={handleClick} aria-hidden="true" data-dialog-overlay role="presentation">
    {#if children}
        {@render children()}
    {/if}
</div>
