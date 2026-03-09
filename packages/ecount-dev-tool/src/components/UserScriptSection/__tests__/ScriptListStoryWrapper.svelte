<script lang="ts">
    import { onMount } from 'svelte';
    import { Toast } from '@personal/uikit';
    import type { UserScript } from '#types/user_script';
    import { resetUserScripts, initializeUserScripts } from '#stores/user_scripts.svelte';
    import { initializeTabState } from '#stores/current_tab.svelte';
    import ScriptList from '../ScriptList.svelte';

    interface Props {
        initialScripts?: UserScript[];
    }

    let { initialScripts = [] }: Props = $props();

    let ready = $state(false);

    function handleEdit(script: UserScript): void {
        void script; // ScriptList onedit 콜백용
    }

    onMount(async () => {
        resetUserScripts();

        const set_local = (globalThis as unknown as { __storybook_set_local_storage?: (k: string, v: unknown) => void })
            .__storybook_set_local_storage;
        if (set_local) {
            set_local('user_scripts_data', initialScripts);
        }

        await initializeUserScripts();
        await initializeTabState();
        ready = true;
    });
</script>

{#if ready}
    <Toast.Provider duration={2500}>
        <ScriptList onedit={handleEdit} />
        <Toast.Root />
    </Toast.Provider>
{/if}
