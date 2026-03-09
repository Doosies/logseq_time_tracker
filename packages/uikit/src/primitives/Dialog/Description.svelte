<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    import { DIALOG_CONTENT_CONTEXT_KEY, type DialogContentContext } from './dialog_context';

    interface Props extends Omit<HTMLAttributes<HTMLParagraphElement>, 'id'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extraClass, ...rest }: Props = $props();
    const content_ctx = getContext<DialogContentContext>(DIALOG_CONTENT_CONTEXT_KEY);
</script>

<p id={content_ctx ? `${content_ctx.id}-description` : undefined} class={extraClass} data-dialog-description {...rest}>
    {@render children()}
</p>
