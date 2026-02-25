<script lang="ts">
    import type { Snippet } from 'svelte';
    import * as styles from '../../design/styles/section.css';

    interface SectionProps {
        title?: string | undefined;
        collapsible?: boolean;
        collapsed?: boolean;
        onToggle?: ((collapsed: boolean) => void) | undefined;
        children: Snippet;
    }

    let { title, collapsible = false, collapsed = false, onToggle, children }: SectionProps = $props();

    function handleToggle(): void {
        if (!collapsible) return;
        const next = !collapsed;
        onToggle?.(next);
    }
</script>

<div class={styles.section_container}>
    {#if title}
        {#if collapsible}
            <button
                type="button"
                class="{styles.section_title} {styles.section_title_collapsible}"
                onclick={handleToggle}
            >
                <span>{title}</span>
                <span class="{styles.section_chevron} {collapsed ? styles.section_chevron_collapsed : ''}">
                    ▼
                </span>
            </button>
        {:else}
            <div class={styles.section_title}>{title}</div>
        {/if}
    {/if}
    <div class="{styles.section_content} {collapsed ? styles.section_content_collapsed : ''}">
        {@render children()}
    </div>
</div>
