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

    let { label = 'Button', ...rest }: Props = $props();
</script>

<Button {...rest}>{label}</Button>
