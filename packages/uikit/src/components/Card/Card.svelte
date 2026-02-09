<script lang="ts">
    import * as styles from '../../design/styles/card.css';

    interface CardProps {
        children: any;
    }

    let { children }: CardProps = $props();
</script>

<div class={styles.card_container}>
    {@render children()}
</div>
