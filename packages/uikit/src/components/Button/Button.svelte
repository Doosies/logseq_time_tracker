<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { ButtonVariant, ButtonSize } from '../../design/types';
    import * as styles from '../../design/styles/button.css';

    interface ButtonProps {
        variant?: ButtonVariant | undefined;
        size?: ButtonSize | undefined;
        disabled?: boolean | undefined;
        fullWidth?: boolean | undefined;
        class?: string | undefined;
        onclick?: (() => void) | undefined;
        children: Snippet;
    }

    let {
        variant = 'primary',
        size = 'md',
        disabled = false,
        fullWidth = false,
        class: extra_class,
        onclick,
        children,
    }: ButtonProps = $props();

    const getClassNames = () => {
        const classes = [styles.button_variant[variant], styles.button_size[size]];
        if (fullWidth) {
            classes.push(styles.button_full_width);
        }
        if (extra_class) {
            classes.push(extra_class);
        }
        return classes.join(' ');
    };
</script>

<button class={getClassNames()} {disabled} onclick={() => onclick?.()} type="button">
    {@render children()}
</button>
