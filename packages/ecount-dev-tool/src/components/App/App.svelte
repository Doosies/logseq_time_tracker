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
    import {
        initializeVisibility,
        isSectionVisible,
    } from '#stores/section_visibility.svelte';
    import {
        initializeSectionOrder,
        getSectionOrder,
        setSectionOrder,
    } from '#stores/section_order.svelte';

    interface DndSectionItem {
        id: string;
    }

    const SECTION_LIST = [
        { id: 'quick-login', label: '빠른 로그인' },
        { id: 'server-manager', label: '서버 관리' },
        { id: 'action-bar', label: '빠른 실행' },
    ];

    const FLIP_DURATION_MS = 200;

    const tab = $derived(getTabState());
    const section_order = $derived(getSectionOrder());

    const visible_ordered_sections = $derived(
        section_order.filter((id) => isSectionVisible(id)),
    );

    const sections_to_render = $derived(
        tab.is_stage
            ? visible_ordered_sections.filter((id) => id === 'quick-login')
            : visible_ordered_sections,
    );

    let dnd_sections = $state<DndSectionItem[]>([]);
    let is_drag_enabled = $state(false);

    const is_dnd_available = $derived(
        !tab.is_loading && !tab.is_stage && dnd_sections.length > 1,
    );

    $effect(() => {
        dnd_sections = sections_to_render.map((id) => ({ id }));
    });

    async function handleDragStart(): Promise<void> {
        is_drag_enabled = true;
        await tick();
    }

    function handlePointerUp(): void {
        is_drag_enabled = false;
    }

    function handleConsider(
        e: CustomEvent<DndEvent<DndSectionItem>>,
    ): void {
        dnd_sections = e.detail.items;
    }

    async function handleFinalize(
        e: CustomEvent<DndEvent<DndSectionItem>>,
    ): Promise<void> {
        dnd_sections = e.detail.items;
        is_drag_enabled = false;

        const new_visible_order = dnd_sections.map((s) => s.id);
        const hidden_sections = section_order.filter(
            (id) => !isSectionVisible(id),
        );
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
            {#each sections_to_render as section_id, i (section_id)}
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
                }}
                onconsider={handleConsider}
                onfinalize={handleFinalize}
            >
                {#each dnd_sections as item (item.id)}
                    <div class="section-wrapper">
                        {#if is_dnd_available}
                            <button
                                type="button"
                                class="section-drag-handle"
                                onpointerdown={handleDragStart}
                                aria-label="드래그하여 섹션 순서 변경"
                            >
                                <svg
                                    width="16"
                                    height="6"
                                    viewBox="0 0 16 6"
                                    fill="currentColor"
                                >
                                    <circle cx="4" cy="1" r="1" />
                                    <circle cx="8" cy="1" r="1" />
                                    <circle cx="12" cy="1" r="1" />
                                    <circle cx="4" cy="5" r="1" />
                                    <circle cx="8" cy="5" r="1" />
                                    <circle cx="12" cy="5" r="1" />
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

    .section-drag-handle {
        position: absolute;
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-background);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        cursor: grab;
        color: var(--color-text-secondary);
        padding: 2px var(--space-md);
        opacity: 0;
        transition:
            opacity 0.15s ease,
            color 0.15s ease;
        z-index: 1;
    }

    .section-wrapper:hover > .section-drag-handle {
        opacity: 0.5;
    }

    .section-drag-handle:hover {
        opacity: 1 !important;
        color: var(--color-text);
        background-color: var(--color-surface);
    }

    .section-drag-handle:active {
        cursor: grabbing;
    }

    .section-wrapper:first-child > .section-drag-handle {
        top: 0;
    }
</style>
