<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    import { DIALOG_CONTENT_CONTEXT_KEY, type DialogContentContext } from './dialog_context';

    interface Props extends Omit<HTMLAttributes<HTMLHeadingElement>, 'id'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extraClass, ...rest }: Props = $props();
    const content_ctx = getContext<DialogContentContext>(DIALOG_CONTENT_CONTEXT_KEY);
</script>

<h2 id={content_ctx ? `${content_ctx.id}-title` : undefined} class={extraClass} data-dialog-title {...rest}>
    {@render children()}
</h2>
