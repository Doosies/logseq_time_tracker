<script lang="ts">
    import { getContext, setContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import { focusTrap } from '../../actions';

    import type { DialogContext } from './Root.svelte';
    import { DIALOG_CONTENT_CONTEXT_KEY } from './dialog_context';

    interface Props {
        closeOnEscape?: boolean;
        closeOnOverlayClick?: boolean;
        children: Snippet;
        class?: string;
    }

    let { closeOnEscape = true, closeOnOverlayClick = true, children, class: extraClass }: Props = $props();

    const ctx = getContext<DialogContext>('dialog');

    $effect(() => {
        ctx.update_content_options({
            closeOnEscape,
            closeOnOverlayClick,
        });
    });

    const id = crypto.randomUUID().slice(0, 8);
    const content_id = `dialog-${id}`;

    setContext(DIALOG_CONTENT_CONTEXT_KEY, { id: content_id });

    function handleClose(): void {
        if (closeOnEscape) {
            ctx.close();
        }
    }
</script>

<div
    class={extraClass}
    role="dialog"
    aria-modal="true"
    aria-labelledby={`${content_id}-title`}
    aria-describedby={`${content_id}-description`}
    id={content_id}
    data-dialog-content
    use:focusTrap={closeOnEscape ? { onclose: handleClose } : {}}
>
    {@render children()}
</div>
