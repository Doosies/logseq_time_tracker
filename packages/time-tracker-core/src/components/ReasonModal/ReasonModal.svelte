<script lang="ts">
    import { STRINGS } from '../../constants/strings';
    import { MAX_REASON_LENGTH } from '../../constants/config';
    import * as css from './reason_modal.css';

    let {
        title,
        description = '',
        placeholder = STRINGS.reason_modal.placeholder,
        max_length = MAX_REASON_LENGTH,
        allow_empty = false,
        onconfirm,
        oncancel,
    }: {
        title: string;
        description?: string;
        placeholder?: string;
        max_length?: number;
        allow_empty?: boolean;
        onconfirm: (reason: string) => void | Promise<void>;
        oncancel: () => void;
    } = $props();

    let reason = $state('');
    let is_loading = $state(false);
    let textarea_ref: HTMLTextAreaElement | undefined = $state(undefined);

    const is_valid = $derived((allow_empty || reason.trim().length >= 1) && reason.length <= max_length);

    $effect(() => {
        textarea_ref?.focus();
    });

    async function handleConfirm() {
        if (!is_valid || is_loading) return;
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

<div class={css.overlay} onkeydown={handleKeydown} role="presentation" tabindex="-1">
    <div class={css.modal} role="dialog" aria-modal="true" aria-labelledby="reason-modal-title">
        <h2 id="reason-modal-title" class={css.modal_title}>{title}</h2>
        {#if description}
            <p class={css.modal_description}>{description}</p>
        {/if}
        <textarea bind:this={textarea_ref} bind:value={reason} class={css.textarea} {placeholder} maxlength={max_length}
        ></textarea>
        <div class={css.char_count}>{reason.length}/{max_length}</div>
        <div class={css.button_row}>
            <button type="button" class={css.button_cancel} onclick={oncancel}>
                {STRINGS.reason_modal.cancel}
            </button>
            <button
                type="button"
                class={css.button_confirm}
                disabled={!is_valid || is_loading}
                onclick={() => void handleConfirm()}
            >
                {#if is_loading}
                    처리 중...
                {:else}
                    {STRINGS.reason_modal.confirm}
                {/if}
            </button>
        </div>
    </div>
</div>
