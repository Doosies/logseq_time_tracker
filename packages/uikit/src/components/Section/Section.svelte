<script lang="ts">
    import type { Snippet } from 'svelte';
    import * as styles from '../../design/styles/section.css';

    interface SectionProps {
        title?: string | undefined;
        action?: Snippet | undefined;
        children: Snippet;
    }

    let { title, action, children }: SectionProps = $props();
</script>

<div class={styles.section_container}>
    {#if title || action}
        <div class={styles.section_title_row}>
            {#if title}
                <div class={styles.section_title} data-drag-handle data-section-header>{title}</div>
            {/if}
            {#if action}
                {@render action()}
            {/if}
        </div>
    {/if}
    <div class={styles.section_content}>
        {@render children()}
    </div>
</div>
