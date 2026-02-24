<script lang="ts">
    import { onMount } from 'svelte';
    import { Card } from '@personal/uikit';
    import { QuickLoginSection } from '#components/QuickLoginSection';
    import { ServerManager } from '#components/ServerManager';
    import { StageManager } from '#components/StageManager';
    import { ActionBar } from '#components/ActionBar';
    import { initializeTabState, getTabState, isSupported } from '#stores/current_tab.svelte';

    const tab = $derived(getTabState());
    const supported = $derived(isSupported());

    onMount(() => {
        initializeTabState();
    });
</script>

<Card>
    <div class="app-content">
        <QuickLoginSection />

        <hr class="divider" />

        {#if tab.is_loading}
            <p>로딩 중...</p>
        {:else if tab.is_stage}
            <StageManager />
        {:else if supported}
            <ServerManager />
            <hr class="divider" />
            <ActionBar />
        {:else}
            <ServerManager />
            <hr class="divider" />
            <ActionBar />
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
        margin: var(--space-md) 0;
    }
</style>
