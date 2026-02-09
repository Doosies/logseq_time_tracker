<script lang="ts">
    import type { Snippet } from 'svelte';
    import * as styles from '../../design/styles/button_group.css';

    interface ButtonGroupProps {
        children: Snippet;
    }

    let { children }: ButtonGroupProps = $props();
</script>

<div class={styles.button_group_container}>
    {@render children()}
</div>
