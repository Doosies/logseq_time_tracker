<script lang="ts">
    import type { UserScript } from '#types/user_script';
    import { Section, Button, Dialog } from '@personal/uikit';
    import ScriptList from './ScriptList.svelte';
    import ScriptEditor from './ScriptEditor.svelte';

    let is_editor_open = $state(false);
    let editing_script = $state<UserScript | undefined>(undefined);

    function handleAdd(): void {
        editing_script = undefined;
        is_editor_open = true;
    }

    function handleEdit(script: UserScript): void {
        editing_script = script;
        is_editor_open = true;
    }

    function handleClose(): void {
        is_editor_open = false;
        editing_script = undefined;
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

<Dialog.Root bind:open={is_editor_open}>
    <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
            <Dialog.Title>{editing_script ? '스크립트 수정' : '스크립트 추가'}</Dialog.Title>
            <ScriptEditor script={editing_script} oncancel={handleClose} onsave={handleClose} />
            <Dialog.Close>×</Dialog.Close>
        </Dialog.Content>
    </Dialog.Portal>
</Dialog.Root>
