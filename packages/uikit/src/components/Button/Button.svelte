<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { ButtonVariant, ButtonSize } from '../../design/types';
    import * as styles from '../../design/styles/button.css';

    interface ButtonProps {
        variant?: ButtonVariant | undefined;
        size?: ButtonSize | undefined;
        disabled?: boolean | undefined;
        fullWidth?: boolean | undefined;
        onclick?: (() => void) | undefined;
        children: Snippet;
    }

    let {
        variant = 'primary',
        size = 'md',
        disabled = false,
        fullWidth = false,
        onclick,
        children,
    }: ButtonProps = $props();

    const getClassNames = () => {
        const classes = [styles.button_variant[variant], styles.button_size[size]];
        if (fullWidth) {
            classes.push(styles.button_full_width);
        }
        return classes.join(' ');
    };
</script>

<button class={getClassNames()} {disabled} onclick={() => onclick?.()} type="button">
    {@render children()}
</button>
