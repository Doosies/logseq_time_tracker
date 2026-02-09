<script lang="ts">
    import type { Snippet } from 'svelte';
    import * as styles from '../../design/styles/card.css';

    interface CardProps {
        children: Snippet;
    }

    let { children }: CardProps = $props();
</script>

<div class={styles.card_container}>
    {@render children()}
</div>
