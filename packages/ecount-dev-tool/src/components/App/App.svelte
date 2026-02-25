<script lang="ts">
    import { onMount } from 'svelte';
    import { Card } from '@personal/uikit';
    import { QuickLoginSection } from '#components/QuickLoginSection';
    import { ServerManager } from '#components/ServerManager';
    import { StageManager } from '#components/StageManager';
    import { ActionBar } from '#components/ActionBar';
    import { SectionSettings } from '#components/SectionSettings';
    import { initializeTabState, getTabState } from '#stores/current_tab.svelte';
    import { initializeAccounts } from '#stores/accounts.svelte';
    import { initializeVisibility, isSectionVisible } from '#stores/section_visibility.svelte';
    import { initializeSectionOrder, getSectionOrder } from '#stores/section_order.svelte';

    const SECTION_LIST = [
        { id: 'quick-login', label: '빠른 로그인' },
        { id: 'server-manager', label: '서버 관리' },
        { id: 'action-bar', label: '빠른 실행' },
    ];

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
            {#each sections_to_render as section_id, i (section_id)}
                {#if i > 0}
                    <hr class="divider" />
                {/if}
                {#if section_id === 'quick-login'}
                    <QuickLoginSection />
                {/if}
            {/each}
            {#if sections_to_render.some((id) => id === 'quick-login')}
                <hr class="divider" />
            {/if}
            <StageManager />
        {:else}
            {#each sections_to_render as section_id, i (section_id)}
                {#if i > 0}
                    <hr class="divider" />
                {/if}
                {#if section_id === 'quick-login'}
                    <QuickLoginSection />
                {:else if section_id === 'server-manager'}
                    <ServerManager />
                {:else if section_id === 'action-bar'}
                    <ActionBar />
                {/if}
            {/each}
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

    .divider {
        border: none;
        border-top: 1px solid var(--color-border);
        margin: var(--space-lg) 0;
        opacity: 0.5;
    }
</style>
