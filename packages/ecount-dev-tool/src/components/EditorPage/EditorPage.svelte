<script lang="ts">
    import { onMount } from 'svelte';
    import { untrack } from 'svelte';
    import type { RunAt, UserScript } from '#types/user_script';
    import { Button, TextInput, Textarea } from '@personal/uikit';
    import CodeEditor from '#components/CodeEditor/CodeEditor.svelte';
    import { addScript, updateScript, getScriptById } from '#stores/user_scripts.svelte';
    import { parseHash, closeEditor } from '#utils/router';

    const hash = parseHash();
    const script_id = hash && hash !== 'new' ? hash : null;
    const is_new = $derived(script_id === null);

    let initial_script: UserScript | null = null;
    let load_error = $state('');

    if (script_id) {
        const found = getScriptById(script_id);
        if (found) {
            initial_script = found;
        } else {
            load_error = '스크립트를 찾을 수 없습니다.';
        }
    } else {
        initial_script = null;
    }

    let name = $state(untrack(() => (initial_script ? initial_script.name : '')));
    let url_patterns_text = $state(untrack(() => (initial_script ? initial_script.url_patterns.join('\n') : '')));
    let code = $state(untrack(() => (initial_script ? initial_script.code : '')));
    let run_at = $state<RunAt>('document_idle');
    let error_message = $state('');

    const can_save = $derived(name.trim() !== '' && code.trim() !== '');
    const page_title = $derived(is_new ? '새 스크립트' : initial_script ? initial_script.name : '스크립트 편집');

    async function handleSave(): Promise<void> {
        if (!can_save) return;

        const patterns = url_patterns_text
            .split('\n')
            .map((p) => p.trim())
            .filter((p) => p !== '');

        error_message = '';

        if (!is_new && script_id) {
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

        await closeEditor();
    }

    function handleClose(): void {
        void closeEditor();
    }

    function handleKeydown(e: KeyboardEvent): void {
        if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            void handleSave();
        }
    }

    onMount(() => {
        document.addEventListener('keydown', handleKeydown);
        return () => document.removeEventListener('keydown', handleKeydown);
    });
</script>

<div class="editor-page">
    <header class="editor-header">
        <Button variant="ghost" size="sm" onclick={handleClose} aria-label="닫기">← 뒤로</Button>
        <h1 class="editor-title">{page_title}</h1>
        <Button variant="primary" size="sm" disabled={!can_save} onclick={handleSave}>저장</Button>
    </header>

    <main class="editor-main">
        {#if load_error}
            <div class="error-panel">
                <p class="error-msg">{load_error}</p>
                <Button variant="secondary" size="sm" onclick={handleClose}>닫기</Button>
            </div>
        {:else}
            <aside class="metadata-panel">
                <div class="form-field">
                    <span class="form-label">이름</span>
                    <TextInput bind:value={name} placeholder="스크립트 이름" />
                </div>
                <div class="form-field">
                    <span class="form-label">URL 패턴 (한 줄에 하나씩)</span>
                    <Textarea bind:value={url_patterns_text} placeholder="*://zeus*.ecount.com/*" rows={6} />
                </div>
            </aside>
            <section class="code-panel">
                <span class="form-label">스크립트 코드</span>
                <CodeEditor bind:value={code} placeholder="document.querySelector(...).click();" />
                {#if error_message}
                    <p class="error-msg">{error_message}</p>
                {/if}
            </section>
        {/if}
    </main>
</div>

<style>
    .editor-page {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }

    .editor-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        padding: 0 var(--space-md);
        flex-shrink: 0;
        border-bottom: 1px solid var(--color-border);
        background: var(--color-background);
    }

    .editor-title {
        margin: 0;
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
    }

    .editor-main {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    .metadata-panel {
        width: 360px;
        flex-shrink: 0;
        padding: var(--space-md);
        overflow-y: auto;
        border-right: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
    }

    .code-panel {
        flex: 1;
        min-width: 0;
        padding: var(--space-md);
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        overflow: hidden;
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

    .error-panel {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-md);
        padding: var(--space-md);
    }

    .error-msg {
        margin: 0;
        font-size: var(--font-size-sm);
        color: var(--color-error);
    }

    @media (max-width: 899px) {
        .editor-main {
            flex-direction: column;
        }

        .metadata-panel {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid var(--color-border);
        }

        .code-panel {
            flex: 1;
        }
    }
</style>
