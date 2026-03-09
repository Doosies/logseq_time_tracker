<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    import type { ButtonVariant, ButtonSize } from '../../design/types';
    import { Button as PrimitiveButton } from '../../primitives/Button';
    import * as styles from '../../design/styles/button.css';

    interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
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
        ...rest
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

<PrimitiveButton class={getClassNames()} {disabled} {onclick} {...rest}>
    {@render children()}
</PrimitiveButton>
