<script lang="ts">
    import PromptDialog from '../PromptDialog.svelte';

    let {
        title,
        description = '',
        placeholder = '',
        max_length = 500,
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

<PromptDialog {title} {description} {placeholder} {max_length} {allow_empty} {onconfirm} {oncancel} />
