<script lang="ts">
    import type { ButtonVariant, ButtonSize } from '../../../design/types';
    import Button from '../Button.svelte';

    interface Props {
        label?: string;
        variant?: ButtonVariant;
        size?: ButtonSize;
        disabled?: boolean;
        fullWidth?: boolean;
        onclick?: () => void;
    }

    let {
        label = '버튼',
        variant = 'primary',
        size = 'md',
        disabled = false,
        fullWidth = false,
        onclick,
    }: Props = $props();
</script>

<Button {variant} {size} {disabled} {fullWidth} {onclick}>{label}</Button>
