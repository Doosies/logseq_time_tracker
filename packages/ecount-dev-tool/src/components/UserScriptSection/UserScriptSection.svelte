<script lang="ts">
    import type { UserScript } from '#types/user_script';
    import { Section, Button } from '@personal/uikit';
    import ScriptList from './ScriptList.svelte';
    import { openEditor } from '#utils/router';

    async function handleAdd(): Promise<void> {
        await openEditor();
    }

    async function handleEdit(script: UserScript): Promise<void> {
        await openEditor(script.id);
    }
</script>

<Section.Root>
    <Section.Header>
        <Section.Title>사용자 스크립트</Section.Title>
        <Section.Action>
            <Button variant="ghost" size="sm" onclick={handleAdd}>+ 추가</Button>
        </Section.Action>
    </Section.Header>
    <Section.Content>
        <ScriptList onedit={handleEdit} />
    </Section.Content>
</Section.Root>
