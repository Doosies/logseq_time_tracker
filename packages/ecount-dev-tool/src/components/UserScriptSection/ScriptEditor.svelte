<script lang="ts">
    import { untrack } from 'svelte';
    import type { RunAt, UserScript } from '#types/user_script';
    import { Button, Select, TextInput, Textarea } from '@personal/uikit';
    import { addScript, updateScript } from '#stores/user_scripts.svelte';

    interface Props {
        script?: UserScript | undefined;
        oncancel: () => void;
        onsave: () => void;
    }

    let { script, oncancel, onsave }: Props = $props();

    const script_id = $derived(script?.id);
    const is_editing = $derived(script_id !== undefined);

    let name = $state(untrack(() => script?.name ?? ''));
    let url_patterns_text = $state(untrack(() => script?.url_patterns.join('\n') ?? ''));
    let code = $state(untrack(() => script?.code ?? ''));
    let run_at = $state<RunAt>(untrack(() => script?.run_at ?? 'document_idle'));
    let error_message = $state('');

    const can_save = $derived(name.trim() !== '' && code.trim() !== '');

    const run_at_options = [
        { value: 'document_start', label: '페이지 로드 전 (document-start)' },
        { value: 'document_idle', label: '페이지 로드 후 (document-idle)' },
    ];

    async function handleSave(): Promise<void> {
        if (!can_save) return;

        const patterns = url_patterns_text
            .split('\n')
            .map((p) => p.trim())
            .filter((p) => p !== '');

        error_message = '';

        if (is_editing && script_id) {
            const result = await updateScript(script_id, {
                name: name.trim(),
                url_patterns: patterns,
                code: code,
                run_at,
            });
            if (!result) {
                error_message = '저장에 실패했습니다.';
                return;
            }
        } else {
            const id = await addScript({
                name: name.trim(),
                enabled: true,
                url_patterns: patterns,
                code: code,
                run_at,
            });
            if (!id) {
                error_message = '추가에 실패했습니다.';
                return;
            }
        }

        onsave();
    }
</script>

<div class="editor-form">
    <div class="form-field">
        <span class="form-label">이름</span>
        <TextInput bind:value={name} placeholder="스크립트 이름" />
    </div>

    <div class="form-field">
        <span class="form-label">URL 패턴 (한 줄에 하나씩)</span>
        <Textarea bind:value={url_patterns_text} placeholder="*://zeus*.ecount.com/*" rows={3} />
    </div>

    <div class="form-field">
        <span class="form-label">실행 시점</span>
        <Select bind:value={run_at} options={run_at_options} />
    </div>

    <div class="form-field">
        <span class="form-label">스크립트 코드</span>
        <Textarea bind:value={code} placeholder="document.querySelector(...).click();" rows={8} monospace />
    </div>

    {#if error_message}
        <p class="error-msg">{error_message}</p>
    {/if}

    <div class="form-actions">
        <Button variant="secondary" size="sm" onclick={oncancel}>취소</Button>
        <Button variant="primary" size="sm" disabled={!can_save} onclick={handleSave}>저장</Button>
    </div>
</div>

<style>
    .editor-form {
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .form-field {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .form-label {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
    }

    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm);
    }

    .error-msg {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-error);
    }
</style>
