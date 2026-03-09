<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';

    import type { DialogContext } from './Root.svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
    const ctx = getContext<DialogContext>('dialog');
</script>

{#if ctx.is_open}
    <div data-dialog-portal>
        {@render children()}
    </div>
{/if}
