<script lang="ts">
    import { onMount } from 'svelte';
    import { initializeTabState } from '#stores/current_tab.svelte';
    import ServerManager from '../ServerManager.svelte';

    interface Props {
        url?: string;
    }

    let { url = 'https://zeus01ba1.ecount.com/ec5/view/erp?__v3domains=ba1' }: Props = $props();

    let ready = $state(false);

    onMount(async () => {
        const set_url = (globalThis as unknown as { __storybook_set_tab_url?: (u: string) => void })
            .__storybook_set_tab_url;
        if (set_url) {
            set_url(url);
        }
        await initializeTabState();
        ready = true;
    });
</script>

{#if ready}
    <ServerManager />
{/if}
