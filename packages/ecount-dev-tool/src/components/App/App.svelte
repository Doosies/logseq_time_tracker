<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Dnd } from '@personal/uikit';
    import { QuickLoginSection } from '#components/QuickLoginSection';
    import { ServerManager } from '#components/ServerManager';
    import { StageManager } from '#components/StageManager';
    import { ActionBar } from '#components/ActionBar';
    import { SectionSettings } from '#components/SectionSettings';
    import { initializeTabState, getTabState } from '#stores/current_tab.svelte';
    import { initializeAccounts } from '#stores/accounts.svelte';
    import { initializeActiveAccount } from '#stores/active_account.svelte';
    import { initializeVisibility, isSectionVisible } from '#stores/section_visibility.svelte';
    import { initializeSectionOrder, getSectionOrder, setSectionOrder } from '#stores/section_order.svelte';

    interface DndSectionItem {
        id: string;
        section_type: string;
    }

    const SECTION_LIST = [
        { id: 'quick-login', label: '빠른 로그인' },
        { id: 'server-manager', label: '서버 관리' },
        { id: 'action-bar', label: '빠른 실행' },
    ];

    const tab = $derived(getTabState());
    const section_order = $derived(getSectionOrder());

    const visible_ordered_sections = $derived(section_order.filter((id) => isSectionVisible(id)));

    const sections_to_render = $derived(
        tab.is_stage ? visible_ordered_sections.filter((id) => id === 'quick-login') : visible_ordered_sections,
    );

    // DnD needs $state for handleReorder mutation; $effect syncs from sections_to_render
    // eslint-disable-next-line svelte/prefer-writable-derived
    let dnd_sections = $state<DndSectionItem[]>([]);

    const is_dnd_available = $derived(!tab.is_loading && !tab.is_stage && dnd_sections.length > 1);

    $effect(() => {
        dnd_sections = sections_to_render.map((id) => ({ id, section_type: id }));
    });

    async function handleReorder(new_sections: DndSectionItem[]): Promise<void> {
        dnd_sections = new_sections;
        const new_visible_order = new_sections.map((s) => s.id);
        const hidden_sections = section_order.filter((id) => !isSectionVisible(id));
        await setSectionOrder([...new_visible_order, ...hidden_sections]);
    }

    onMount(() => {
        initializeTabState();
        initializeAccounts();
        initializeActiveAccount();
        initializeVisibility();
        initializeSectionOrder();
    });
</script>

<Card.Root>
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
        {:else if is_dnd_available}
            <Dnd.Provider items={dnd_sections} onreorder={handleReorder} class="sections-dnd-container">
                {#each dnd_sections as item, index (item.id)}
                    <Dnd.Sortable id={item.id} {index}>
                        {#snippet children({ handleAttach })}
                            <div class="section-wrapper">
                                <div
                                    class="drag-handle-bar"
                                    data-drag-handle
                                    role="button"
                                    tabindex="-1"
                                    aria-label="드래그하여 섹션 순서 변경"
                                    {@attach handleAttach}
                                >
                                    <span class="grip-dots"></span>
                                </div>
                                {#if item.section_type === 'quick-login'}
                                    <QuickLoginSection />
                                {:else if item.section_type === 'server-manager'}
                                    <ServerManager />
                                {:else if item.section_type === 'action-bar'}
                                    <ActionBar />
                                {/if}
                            </div>
                        {/snippet}
                    </Dnd.Sortable>
                {/each}
            </Dnd.Provider>
        {:else}
            <div class="sections-dnd-container">
                {#each dnd_sections as item (item.id)}
                    <div class="section-wrapper">
                        {#if item.section_type === 'quick-login'}
                            <QuickLoginSection />
                        {:else if item.section_type === 'server-manager'}
                            <ServerManager />
                        {:else if item.section_type === 'action-bar'}
                            <ActionBar />
                        {/if}
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</Card.Root>

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

    :global(.sections-dnd-container) {
        display: flex;
        flex-direction: column;
    }

    :global(.section-wrapper) {
        position: relative;
        border-radius: var(--radius-md, 8px);
        border: 1px solid transparent;
        padding: var(--space-sm, 4px);
        transition:
            background-color var(--transition-normal, 0.15s ease),
            border-color var(--transition-normal, 0.15s ease);
    }

    :global(.section-wrapper:hover) {
        background-color: var(--color-disabled, #f1f5f9);
        border-color: var(--color-border, #e2e8f0);
    }

    :global(.section-wrapper + .section-wrapper) {
        margin-top: var(--space-sm);
    }

    :global(.drag-handle-bar:hover) {
        opacity: 0.7;
        background-color: var(--color-surface, #f8fafc);
        color: var(--color-primary, #2563eb);
    }

    :global(.drag-handle-bar) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 3px 0;
        margin-bottom: var(--space-xs, 2px);
        color: var(--color-text-secondary, #64748b);
        background: none;
        border: none;
        border-radius: var(--radius-sm, 6px);
        opacity: 0.3;
        transition:
            opacity var(--transition-normal, 0.15s ease),
            background-color var(--transition-normal, 0.15s ease),
            color var(--transition-normal, 0.15s ease);
        user-select: none;
        cursor: grab;
    }

    :global(.drag-handle-bar)::before,
    :global(.drag-handle-bar)::after {
        content: '';
        flex: 1;
        height: 1px;
        background: currentColor;
        opacity: 0.4;
    }

    :global(.drag-handle-bar)::before {
        margin-right: var(--space-sm, 4px);
    }

    :global(.drag-handle-bar)::after {
        margin-left: var(--space-sm, 4px);
    }

    :global(.drag-handle-bar:active) {
        opacity: 1;
        cursor: grabbing;
    }

    :global(.grip-dots) {
        width: 14px;
        height: 8px;
        background-image: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
        background-repeat: repeat;
        background-size: 4px 4px;
        background-position:
            0 0,
            4px 0,
            8px 0;
        display: block;
        flex-shrink: 0;
    }
</style>
