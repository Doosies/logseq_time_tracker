<script lang="ts">
    import * as styles from '../../design/styles/button_group.css';

    interface ButtonGroupProps {
        children: any;
    }

    let { children }: ButtonGroupProps = $props();
</script>

<div class={styles.button_group_container}>
    {@render children()}
</div>
