<script lang="ts">
    import { onMount } from 'svelte';
    import { Toast } from '@personal/uikit';
    import { initializeTabState } from '#stores/current_tab.svelte';
    import StageManager from '../StageManager.svelte';

    interface Props {
        url?: string;
    }

    let { url = 'https://stageba.ecount.com/ec5/view/erp' }: Props = $props();

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
    <Toast.Provider duration={2500}>
        <StageManager />
        <Toast.Root />
    </Toast.Provider>
{/if}
