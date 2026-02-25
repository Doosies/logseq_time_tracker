<script lang="ts">
    import type { Snippet } from 'svelte';
    import * as styles from '../../design/styles/section.css';

    interface SectionProps {
        title?: string | undefined;
        children: Snippet;
    }

    let { title, children }: SectionProps = $props();
</script>

<div class={styles.section_container}>
    {#if title}
        <div class={styles.section_title} data-drag-handle>{title}</div>
    {/if}
    <div class={styles.section_content}>
        {@render children()}
    </div>
</div>
