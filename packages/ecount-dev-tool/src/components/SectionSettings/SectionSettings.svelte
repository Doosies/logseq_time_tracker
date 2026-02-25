<script lang="ts">
    import { isSectionVisible, toggleVisibility } from '#stores/section_visibility.svelte';

    interface SectionItem {
        id: string;
        label: string;
    }

    interface SectionSettingsProps {
        sections: SectionItem[];
    }

    let { sections }: SectionSettingsProps = $props();

    let is_open = $state(false);

    function handleToggle(): void {
        is_open = !is_open;
    }

    function handleClickOutside(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.settings-root')) {
            is_open = false;
        }
    }

    function handleKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            is_open = false;
        }
    }

    const all_ids = $derived(sections.map((s) => s.id));

    async function handleItemToggle(section_id: string): Promise<void> {
        await toggleVisibility(section_id, all_ids);
    }
</script>

<svelte:document onclick={handleClickOutside} onkeydown={handleKeydown} />

<div class="settings-root">
    <button
        type="button"
        class="settings-trigger"
        onclick={handleToggle}
        aria-label="섹션 설정"
        aria-expanded={is_open}
    >
        ⚙
    </button>

    {#if is_open}
        <div class="settings-panel" role="menu">
            <div class="panel-title">섹션 표시 설정</div>
            {#each sections as section (section.id)}
                {@const visible = isSectionVisible(section.id)}
                {@const visible_count = all_ids.filter((id) => isSectionVisible(id)).length}
                {@const is_last_visible = visible && visible_count <= 1}
                <label
                    class="settings-item"
                    class:disabled={is_last_visible}
                >
                    <input
                        type="checkbox"
                        checked={visible}
                        disabled={is_last_visible}
                        onchange={() => handleItemToggle(section.id)}
                    />
                    <span class="item-label">{section.label}</span>
                </label>
            {/each}
        </div>
    {/if}
</div>

<style>
    .settings-root {
        position: relative;
        display: flex;
        justify-content: flex-end;
    }

    .settings-trigger {
        background: none;
        border: none;
        cursor: pointer;
        font-size: var(--font-size-md);
        color: var(--color-text-secondary);
        padding: var(--space-xs) var(--space-sm);
        border-radius: var(--radius-sm);
        transition: color 0.15s ease, background-color 0.15s ease;
        line-height: 1;
    }

    .settings-trigger:hover {
        color: var(--color-text);
        background-color: var(--color-surface);
    }

    .settings-panel {
        position: absolute;
        top: 100%;
        right: 0;
        z-index: 10;
        min-width: 160px;
        background-color: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        padding: var(--space-sm) 0;
    }

    .panel-title {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        padding: var(--space-sm) var(--space-md);
        font-weight: var(--font-weight-medium);
        border-bottom: 1px solid var(--color-border);
        margin-bottom: var(--space-xs);
    }

    .settings-item {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        padding: var(--space-sm) var(--space-md);
        cursor: pointer;
        transition: background-color 0.1s ease;
    }

    .settings-item:hover {
        background-color: var(--color-surface);
    }

    .settings-item.disabled {
        cursor: not-allowed;
        opacity: 0.5;
    }

    .settings-item.disabled:hover {
        background-color: transparent;
    }

    .settings-item input[type='checkbox'] {
        accent-color: var(--color-primary);
        cursor: inherit;
    }

    .item-label {
        font-size: var(--font-size-sm);
        color: var(--color-text);
        user-select: none;
    }
</style>
