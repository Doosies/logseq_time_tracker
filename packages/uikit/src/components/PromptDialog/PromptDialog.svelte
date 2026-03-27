<!--
@component PromptDialog - 테마가 적용된 사유·프롬프트 입력 모달.
  Props: title, description, placeholder, max_length, allow_empty, confirm_label, cancel_label, loading_label, onconfirm(reason), oncancel.
-->
<script lang="ts">
    import * as styles from '../../design/styles/prompt_dialog.css';

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

<div class={styles.overlay} onkeydown={handleKeydown} role="presentation" tabindex="-1">
    <div class={styles.modal} role="dialog" aria-modal="true" aria-labelledby="prompt-dialog-title">
        <h2 id="prompt-dialog-title" class={styles.modal_title}>{title}</h2>
        {#if description}
            <p class={styles.modal_description}>{description}</p>
        {/if}
        <textarea
            bind:this={textarea_ref}
            bind:value={reason}
            class={styles.textarea}
            {placeholder}
            maxlength={max_length}
        ></textarea>
        <div class={styles.char_count}>{reason.length}/{max_length}</div>
        <div class={styles.button_row}>
            <button type="button" class={styles.button_cancel} onclick={oncancel}>
                {cancel_label}
            </button>
            <button
                type="button"
                class={styles.button_confirm}
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
