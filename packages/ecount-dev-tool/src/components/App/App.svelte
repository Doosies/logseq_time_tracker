<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { dndzone } from 'svelte-dnd-action';
    import type { DndEvent } from 'svelte-dnd-action';
    import { Card } from '@personal/uikit';
    import { QuickLoginSection } from '#components/QuickLoginSection';
    import { ServerManager } from '#components/ServerManager';
    import { StageManager } from '#components/StageManager';
    import { ActionBar } from '#components/ActionBar';
    import { SectionSettings } from '#components/SectionSettings';
    import { initializeTabState, getTabState } from '#stores/current_tab.svelte';
    import { initializeAccounts } from '#stores/accounts.svelte';
    import { initializeVisibility, isSectionVisible } from '#stores/section_visibility.svelte';
    import { initializeSectionOrder, getSectionOrder, setSectionOrder } from '#stores/section_order.svelte';

    interface DndSectionItem {
        id: string;
    }

    const SECTION_LIST = [
        { id: 'quick-login', label: '빠른 로그인' },
        { id: 'server-manager', label: '서버 관리' },
        { id: 'action-bar', label: '빠른 실행' },
    ];

    const FLIP_DURATION_MS = 200;
    const DROP_TARGET_STYLE = { outline: 'none' };

    const tab = $derived(getTabState());
    const section_order = $derived(getSectionOrder());

    const visible_ordered_sections = $derived(section_order.filter((id) => isSectionVisible(id)));

    const sections_to_render = $derived(
        tab.is_stage ? visible_ordered_sections.filter((id) => id === 'quick-login') : visible_ordered_sections,
    );

    let dnd_sections = $state<DndSectionItem[]>([]);
    let is_drag_enabled = $state(false);

    const is_dnd_available = $derived(!tab.is_loading && !tab.is_stage && dnd_sections.length > 1);

    $effect(() => {
        dnd_sections = sections_to_render.map((id) => ({ id }));
    });

    function transformDraggedElement(el: HTMLElement | undefined): void {
        if (!el) return;
        el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.18)';
        el.style.borderRadius = '8px';
        el.style.opacity = '0.92';
        el.style.background = 'var(--color-background)';
        el.style.border = '1px solid var(--color-border)';
    }

    async function handleDragStart(): Promise<void> {
        is_drag_enabled = true;
        await tick();
    }

    function handlePointerUp(): void {
        is_drag_enabled = false;
    }

    function handleConsider(e: CustomEvent<DndEvent<DndSectionItem>>): void {
        dnd_sections = e.detail.items;
    }

    async function handleFinalize(e: CustomEvent<DndEvent<DndSectionItem>>): Promise<void> {
        dnd_sections = e.detail.items;
        is_drag_enabled = false;

        const new_visible_order = dnd_sections.map((s) => s.id);
        const hidden_sections = section_order.filter((id) => !isSectionVisible(id));
        await setSectionOrder([...new_visible_order, ...hidden_sections]);
    }

    onMount(() => {
        initializeTabState();
        initializeAccounts();
        initializeVisibility();
        initializeSectionOrder();
    });
</script>

<svelte:window onpointerup={handlePointerUp} />

<Card>
    <div class="app-content">
        <SectionSettings sections={SECTION_LIST} />

        {#if tab.is_loading}
            <p>로딩 중...</p>
        {:else if tab.is_stage}
            {#each sections_to_render as section_id (section_id)}
                {#if section_id === 'quick-login'}
                    <QuickLoginSection />
                {/if}
            {/each}
            <div class="section-divider"></div>
            <StageManager />
        {:else}
            <div
                class="sections-dnd-container"
                use:dndzone={{
                    items: dnd_sections,
                    flipDurationMs: FLIP_DURATION_MS,
                    dragDisabled: !is_drag_enabled,
                    type: 'main-sections',
                    dropTargetStyle: DROP_TARGET_STYLE,
                    transformDraggedElement,
                }}
                onconsider={handleConsider}
                onfinalize={handleFinalize}
            >
                {#each dnd_sections as item (item.id)}
                    <div class="section-wrapper">
                        {#if is_dnd_available}
                            <button
                                type="button"
                                class="section-drag-bar"
                                onpointerdown={handleDragStart}
                                aria-label="드래그하여 섹션 순서 변경"
                            >
                                <svg width="14" height="8" viewBox="0 0 14 8" fill="currentColor">
                                    <circle cx="3" cy="2" r="1.2" />
                                    <circle cx="7" cy="2" r="1.2" />
                                    <circle cx="11" cy="2" r="1.2" />
                                    <circle cx="3" cy="6" r="1.2" />
                                    <circle cx="7" cy="6" r="1.2" />
                                    <circle cx="11" cy="6" r="1.2" />
                                </svg>
                            </button>
                        {/if}
                        {#if item.id === 'quick-login'}
                            <QuickLoginSection />
                        {:else if item.id === 'server-manager'}
                            <ServerManager />
                        {:else if item.id === 'action-bar'}
                            <ActionBar />
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</Card>

<style>
    .app-content {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .app-content > :global(*) {
        width: 100%;
    }

    .section-divider {
        border-top: 1px solid var(--color-border);
        margin: var(--space-lg) 0;
        opacity: 0.5;
    }

    .sections-dnd-container {
        display: flex;
        flex-direction: column;
    }

    .section-wrapper {
        position: relative;
    }

    .section-wrapper + .section-wrapper {
        margin-top: var(--space-lg);
        padding-top: var(--space-lg);
        border-top: 1px solid var(--color-border);
    }

    .section-drag-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 3px 0;
        margin-bottom: var(--space-xs);
        cursor: grab;
        color: var(--color-text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        opacity: 0.3;
        transition:
            opacity 0.15s ease,
            background-color 0.15s ease,
            color 0.15s ease;
    }

    .section-drag-bar::before,
    .section-drag-bar::after {
        content: '';
        flex: 1;
        height: 1px;
        background: currentColor;
        opacity: 0.4;
    }

    .section-drag-bar::before {
        margin-right: var(--space-sm);
    }

    .section-drag-bar::after {
        margin-left: var(--space-sm);
    }

    .section-drag-bar:hover {
        opacity: 0.7;
        background-color: var(--color-surface);
        color: var(--color-primary);
    }

    .section-drag-bar:active {
        cursor: grabbing;
        opacity: 1;
    }
</style>
