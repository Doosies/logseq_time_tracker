<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Dnd } from '@personal/uikit';
    import type { DndEvent } from '@personal/uikit';
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

    let dnd_sections = $state<DndSectionItem[]>([]);

    const is_dnd_available = $derived(!tab.is_loading && !tab.is_stage && dnd_sections.length > 1);

    $effect(() => {
        dnd_sections = sections_to_render.map((id) => ({ id, section_type: id }));
    });

    function handleConsider(e: CustomEvent<DndEvent<DndSectionItem>>): void {
        dnd_sections = e.detail.items;
    }

    async function handleFinalize(e: CustomEvent<DndEvent<DndSectionItem>>): Promise<void> {
        dnd_sections = e.detail.items;

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
            <Dnd.Zone
                items={dnd_sections}
                type="main-sections"
                dragDisabled={!is_dnd_available}
                onconsider={handleConsider}
                onfinalize={handleFinalize}
                class="sections-dnd-container"
            >
                {#each dnd_sections as item (item.id)}
                    <Dnd.Row class="section-wrapper">
                        {#if is_dnd_available}
                            <Dnd.Handle label="드래그하여 섹션 순서 변경" />
                        {/if}
                        {#if item.section_type === 'quick-login'}
                            <QuickLoginSection />
                        {:else if item.section_type === 'server-manager'}
                            <ServerManager />
                        {:else if item.section_type === 'action-bar'}
                            <ActionBar />
                        {/if}
                    </Dnd.Row>
                {/each}
            </Dnd.Zone>
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

    :global(.sections-dnd-container) {
        display: flex;
        flex-direction: column;
    }

    :global(.section-wrapper) {
        position: relative;
    }

    :global(.section-wrapper + .section-wrapper) {
        margin-top: var(--space-sm);
    }

    :global(.section-wrapper:hover) :global([data-drag-handle]) {
        opacity: 0.7;
        background-color: var(--color-surface);
        color: var(--color-primary);
    }
</style>
