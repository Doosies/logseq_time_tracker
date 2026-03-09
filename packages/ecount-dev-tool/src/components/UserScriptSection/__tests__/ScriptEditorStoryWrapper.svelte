<script lang="ts">
    import { onMount } from 'svelte';
    import type { UserScript } from '#types/user_script';
    import { resetUserScripts, initializeUserScripts } from '#stores/user_scripts.svelte';
    import ScriptEditor from '../ScriptEditor.svelte';

    interface Props {
        script?: UserScript | undefined;
        initialScripts?: UserScript[];
    }

    let { script, initialScripts = [] }: Props = $props();

    let ready = $state(false);

    function handleCancel(): void {}
    function handleSave(): void {}

    onMount(async () => {
        resetUserScripts();

        const set_local = (globalThis as unknown as { __storybook_set_local_storage?: (k: string, v: unknown) => void })
            .__storybook_set_local_storage;
        if (set_local) {
            set_local('user_scripts_data', initialScripts);
        }

        await initializeUserScripts();
        ready = true;
    });
</script>

{#if ready}
    <ScriptEditor {script} oncancel={handleCancel} onsave={handleSave} />
{/if}
