<script lang="ts">
    import type { Snippet } from 'svelte';
    import { ButtonGroup as PrimitiveButtonGroup } from '../../primitives/ButtonGroup';
    import * as styles from '../../design/styles/button_group.css';

    interface ButtonGroupProps {
        children: Snippet;
    }

    let { children }: ButtonGroupProps = $props();
</script>

<PrimitiveButtonGroup class={styles.button_group_container}>
    {@render children()}
</PrimitiveButtonGroup>
