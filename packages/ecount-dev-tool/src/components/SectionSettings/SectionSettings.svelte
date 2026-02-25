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
        title="섹션 표시 설정"
    >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
            <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.902 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.116l.094-.318z"/>
        </svg>
    </button>

    {#if is_open}
        <div class="settings-panel" role="menu">
            <div class="panel-title">섹션 표시 설정</div>
            {#each sections as section (section.id)}
                {@const visible = isSectionVisible(section.id)}
                {@const visible_count = all_ids.filter((id) => isSectionVisible(id)).length}
                {@const is_last_visible = visible && visible_count <= 1}
                <label class="settings-item" class:disabled={is_last_visible}>
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
        margin-bottom: var(--space-xs);
    }

    .settings-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-secondary);
        padding: var(--space-xs);
        border-radius: var(--radius-sm);
        transition:
            color 0.15s ease,
            background-color 0.15s ease;
        opacity: 0.6;
    }

    .settings-trigger:hover {
        color: var(--color-text);
        background-color: var(--color-surface);
        opacity: 1;
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
