<script lang="ts">
    import * as styles from '../../design/styles/section.css';

    interface SectionProps {
        title?: string;
        children: any;
    }

    let { title, children }: SectionProps = $props();
</script>

<div class={styles.section_container}>
    {#if title}
        <div class={styles.section_title}>{title}</div>
    {/if}
    <div class={styles.section_content}>
        {@render children()}
    </div>
</div>
