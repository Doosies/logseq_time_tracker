<!--
@component ReasonModal — PromptDialog의 도메인 특화 래퍼
-->
<script lang="ts">
    import { PromptDialog } from '@personal/uikit';
    import { STRINGS } from '../../constants/strings';
    import { MAX_REASON_LENGTH } from '../../constants/config';

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
</script>

<PromptDialog
    {title}
    {description}
    {placeholder}
    {max_length}
    {allow_empty}
    confirm_label={STRINGS.reason_modal.confirm}
    cancel_label={STRINGS.reason_modal.cancel}
    {onconfirm}
    {oncancel}
/>
