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
    import { initializeSectionState, getSectionCollapsed, toggleSection } from '#stores/section_collapse.svelte';
    import { initializeVisibility, isSectionVisible } from '#stores/section_visibility.svelte';

    const SECTION_LIST = [
        { id: 'quick-login', label: '빠른 로그인' },
        { id: 'server-manager', label: '서버 관리' },
        { id: 'action-bar', label: '빠른 실행' },
    ];

    const tab = $derived(getTabState());

    const show_quick_login = $derived(isSectionVisible('quick-login'));
    const show_server_manager = $derived(isSectionVisible('server-manager'));
    const show_action_bar = $derived(isSectionVisible('action-bar'));

    const need_divider_after_login = $derived(show_quick_login && (show_server_manager || show_action_bar));
    const need_divider_between_sm_ab = $derived(show_server_manager && show_action_bar);

    onMount(() => {
        initializeTabState();
        initializeAccounts();
        initializeSectionState();
        initializeVisibility();
    });
</script>

<Card>
    <div class="app-content">
        <SectionSettings sections={SECTION_LIST} />

        {#if show_quick_login}
            <QuickLoginSection
                collapsed={getSectionCollapsed('quick-login')}
                onToggle={() => toggleSection('quick-login')}
            />
        {/if}

        {#if tab.is_loading}
            {#if need_divider_after_login}
                <hr class="divider" />
            {/if}
            <p>로딩 중...</p>
        {:else if tab.is_stage}
            {#if show_quick_login}
                <hr class="divider" />
            {/if}
            <StageManager />
        {:else}
            {#if show_server_manager}
                {#if need_divider_after_login}
                    <hr class="divider" />
                {/if}
                <ServerManager
                    collapsed={getSectionCollapsed('server-manager')}
                    onToggle={() => toggleSection('server-manager')}
                />
            {/if}

            {#if show_action_bar}
                {#if need_divider_between_sm_ab || (!show_server_manager && need_divider_after_login)}
                    <hr class="divider" />
                {/if}
                <ActionBar collapsed={getSectionCollapsed('action-bar')} onToggle={() => toggleSection('action-bar')} />
            {/if}
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
