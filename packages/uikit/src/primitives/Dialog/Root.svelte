<script lang="ts">
    import { setContext } from 'svelte';
    import type { Snippet } from 'svelte';

    export interface DialogContentOptions {
        closeOnOverlayClick?: boolean;
        closeOnEscape?: boolean;
    }

    export interface DialogContext {
        get is_open(): boolean;
        open: () => void;
        close: () => void;
        content_options: DialogContentOptions;
        update_content_options: (opts: Partial<DialogContentOptions>) => void;
    }

    interface Props {
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
        children: Snippet;
        class?: string;
    }

    let { open = $bindable(false), onOpenChange, children, class: extraClass }: Props = $props();

    const content_options = $state<DialogContentOptions>({
        closeOnOverlayClick: true,
        closeOnEscape: true,
    });

    function openDialog(): void {
        open = true;
        onOpenChange?.(true);
    }

    function closeDialog(): void {
        open = false;
        onOpenChange?.(false);
    }

    function updateContentOptions(opts: Partial<DialogContentOptions>): void {
        content_options.closeOnOverlayClick = opts.closeOnOverlayClick ?? content_options.closeOnOverlayClick ?? true;
        content_options.closeOnEscape = opts.closeOnEscape ?? content_options.closeOnEscape ?? true;
    }

    const ctx: DialogContext = {
        get is_open() {
            return open;
        },
        open: openDialog,
        close: closeDialog,
        get content_options() {
            return content_options;
        },
        update_content_options: updateContentOptions,
    };

    setContext('dialog', ctx);
</script>

<div class={extraClass}>
    {@render children()}
</div>
