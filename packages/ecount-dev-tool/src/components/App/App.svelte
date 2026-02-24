<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '@personal/uikit';
  import { QuickLoginSection } from '@/components/QuickLoginSection';
  import { ServerManager } from '@/components/ServerManager';
  import { StageManager } from '@/components/StageManager';
  import { ActionBar } from '@/components/ActionBar';
  import {
    initializeTabState,
    getTabState,
    isSupported,
  } from '@/stores/current_tab.svelte';

  const tab = $derived(getTabState());
  const supported = $derived(isSupported());

  onMount(() => {
    initializeTabState();
  });
</script>

<Card>
  <QuickLoginSection />

  {#if tab.is_loading}
    <p>로딩 중...</p>
  {:else if tab.is_stage}
    <StageManager />
  {:else if supported}
    <ServerManager />
    <ActionBar />
  {:else}
    <ServerManager />
    <ActionBar />
  {/if}
</Card>