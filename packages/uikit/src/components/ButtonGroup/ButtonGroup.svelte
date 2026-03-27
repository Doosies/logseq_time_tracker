<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    import * as styles from '../../design/styles/button_group.css';

    interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
        children: Snippet;
        class?: string | undefined;
    }

    let { children, class: extra_class, ...rest }: ButtonGroupProps = $props();

    const class_name = $derived([styles.button_group_container, extra_class].filter(Boolean).join(' '));
</script>

<div class={class_name} role="group" {...rest}>
    {@render children()}
</div>
