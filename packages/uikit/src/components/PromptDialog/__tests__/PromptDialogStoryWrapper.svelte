<script lang="ts">
    import PromptDialog from '../PromptDialog.svelte';

    interface Props {
        title: string;
        description?: string;
        placeholder?: string;
        max_length?: number;
        allow_empty?: boolean;
        confirm_label?: string;
        cancel_label?: string;
        loading_label?: string;
        onconfirm?: (reason: string) => void | Promise<void>;
        oncancel?: () => void;
    }

    let {
        title,
        description = '',
        placeholder = '사유를 입력하세요',
        max_length = 500,
        allow_empty = false,
        confirm_label = '확인',
        cancel_label = '취소',
        loading_label = '처리 중...',
        onconfirm = () => {},
        oncancel = () => {},
    }: Props = $props();
</script>

<PromptDialog
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
/>
