<!--
@component PromptDialog - 테마가 적용된 사유·프롬프트 입력 모달
-->
<script lang="ts">
    import { PromptDialog as PrimitivePromptDialog } from '../../primitives/PromptDialog';
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

    const dialog_classes = {
        overlay: styles.overlay,
        modal: styles.modal,
        modal_title: styles.modal_title,
        modal_description: styles.modal_description,
        textarea: styles.textarea,
        char_count: styles.char_count,
        button_row: styles.button_row,
        button_confirm: styles.button_confirm,
        button_cancel: styles.button_cancel,
    };
</script>

<PrimitivePromptDialog
    {title}
    {description}
    {placeholder}
    {max_length}
    {allow_empty}
    {confirm_label}
    {cancel_label}
    {loading_label}
    {onconfirm}
    {oncancel}
    classes={dialog_classes}
/>
