<script lang="ts">
    import type { UserScript } from '#types/user_script';
    import { Section, Button } from '@personal/uikit';
    import ScriptList from './ScriptList.svelte';
    import ScriptEditor from './ScriptEditor.svelte';

    type ViewMode = 'list' | 'editor';

    let view_mode = $state<ViewMode>('list');
    let editing_script = $state<UserScript | undefined>(undefined);

    function handleAdd(): void {
        editing_script = undefined;
        view_mode = 'editor';
    }

    function handleEdit(script: UserScript): void {
        editing_script = script;
        view_mode = 'editor';
    }

    function handleCancel(): void {
        view_mode = 'list';
        editing_script = undefined;
    }

    function handleSave(): void {
        view_mode = 'list';
        editing_script = undefined;
    }
</script>

<Section.Root>
    <Section.Header>
        <Section.Title>사용자 스크립트</Section.Title>
        <Section.Action>
            {#if view_mode === 'list'}
                <Button variant="ghost" size="sm" onclick={handleAdd}>+ 추가</Button>
            {/if}
        </Section.Action>
    </Section.Header>
    <Section.Content>
        {#if view_mode === 'list'}
            <ScriptList onedit={handleEdit} />
        {:else}
            <ScriptEditor script={editing_script} oncancel={handleCancel} onsave={handleSave} />
        {/if}
    </Section.Content>
</Section.Root>
