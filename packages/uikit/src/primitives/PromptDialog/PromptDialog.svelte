<script lang="ts">
    interface PromptDialogClasses {
        overlay?: string;
        modal?: string;
        modal_title?: string;
        modal_description?: string;
        textarea?: string;
        char_count?: string;
        button_row?: string;
        button_confirm?: string;
        button_cancel?: string;
    }

    let {
        title,
        description = '',
        placeholder = '',
        max_length = 500,
        allow_empty = false,
        confirm_label = '확인',
        cancel_label = '취소',
        loading_label = '처리 중...',
        onconfirm,
        oncancel,
        classes,
    }: {
        title: string;
        description?: string;
        placeholder?: string;
        max_length?: number;
        allow_empty?: boolean;
        confirm_label?: string;
        cancel_label?: string;
        loading_label?: string;
        onconfirm: (reason: string) => void | Promise<void>;
        oncancel: () => void;
        classes?: PromptDialogClasses | undefined;
    } = $props();

    let reason = $state('');
    let is_loading = $state(false);
    let textarea_ref: HTMLTextAreaElement | undefined = $state(undefined);

    const is_valid = $derived((allow_empty || reason.trim().length >= 1) && reason.length <= max_length);

    $effect(() => {
        textarea_ref?.focus();
    });

    async function handleConfirm() {
        if (!is_valid || is_loading) {
            return;
        }
        is_loading = true;
        try {
            await Promise.resolve(onconfirm(reason.trim()));
        } finally {
            is_loading = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            oncancel();
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            void handleConfirm();
        }
    }
</script>

<div class={classes?.overlay} onkeydown={handleKeydown} role="presentation" tabindex="-1">
    <div class={classes?.modal} role="dialog" aria-modal="true" aria-labelledby="prompt-dialog-title">
        <h2 id="prompt-dialog-title" class={classes?.modal_title}>{title}</h2>
        {#if description}
            <p class={classes?.modal_description}>{description}</p>
        {/if}
        <textarea
            bind:this={textarea_ref}
            bind:value={reason}
            class={classes?.textarea}
            {placeholder}
            maxlength={max_length}
        ></textarea>
        <div class={classes?.char_count}>{reason.length}/{max_length}</div>
        <div class={classes?.button_row}>
            <button type="button" class={classes?.button_cancel} onclick={oncancel}>
                {cancel_label}
            </button>
            <button
                type="button"
                class={classes?.button_confirm}
                disabled={!is_valid || is_loading}
                onclick={() => void handleConfirm()}
            >
                {#if is_loading}
                    {loading_label}
                {:else}
                    {confirm_label}
                {/if}
            </button>
        </div>
    </div>
</div>
