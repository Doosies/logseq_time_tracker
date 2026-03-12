<script lang="ts">
    import { getContext } from 'svelte';
    import type { UserScript } from '#types/user_script';
    import { Button, Tooltip } from '@personal/uikit';
    import { getScripts, toggleScript, deleteScript } from '#stores/user_scripts.svelte';
    import { executeUserScript } from '#services/script_executor';
    import { getTabState } from '#stores/current_tab.svelte';

    const toast_ctx = getContext<{ show: (message: string) => void }>('toast');

    interface Props {
        onedit: (script: UserScript) => void;
    }

    let { onedit }: Props = $props();

    const scripts = $derived(getScripts());
    const tab = $derived(getTabState());

    let run_status = $state<Record<string, 'success' | 'error' | null>>({});

    async function handleRun(script: UserScript): Promise<void> {
        const result = await executeUserScript(tab.tab_id, script.code);
        run_status = { ...run_status, [script.id]: result.success ? 'success' : 'error' };

        if (!result.success && result.error) {
            toast_ctx?.show(`스크립트 실행 실패: ${result.error}`);
        }

        setTimeout(() => {
            run_status = { ...run_status, [script.id]: null };
        }, 2000);
    }

    async function handleDelete(script: UserScript): Promise<void> {
        if (!confirm(`"${script.name}" 스크립트를 삭제하시겠습니까?`)) {
            return;
        }
        await deleteScript(script.id);
    }

    async function handleToggle(script: UserScript): Promise<void> {
        await toggleScript(script.id);
    }

    function truncatePatterns(patterns: string[]): string {
        if (patterns.length === 0) return '패턴 없음';
        const first = patterns[0] ?? '';
        if (patterns.length === 1) return first;
        return `${first} 외 ${patterns.length - 1}개`;
    }
</script>

{#if scripts.length === 0}
    <p class="empty-msg">스크립트가 없습니다. 추가 버튼을 눌러 등록하세요.</p>
{:else}
    <div class="script-list">
        {#each scripts as script (script.id)}
            <div class="script-item">
                <div class="script-info">
                    <div class="script-header">
                        <label class="toggle-switch">
                            <input type="checkbox" checked={script.enabled} onchange={() => handleToggle(script)} />
                            <span class="toggle-slider"></span>
                        </label>
                        <span class="script-name" class:disabled={!script.enabled}>
                            {script.name}
                        </span>
                    </div>
                    <span class="script-patterns">{truncatePatterns(script.url_patterns)}</span>
                </div>
                <div class="script-actions">
                    <Tooltip content="스크립트 실행">
                        <Button variant="ghost" size="sm" aria-label="스크립트 실행" onclick={() => handleRun(script)}>
                            {#if run_status[script.id] === 'success'}
                                ✓
                            {:else if run_status[script.id] === 'error'}
                                ✗
                            {:else}
                                ▶
                            {/if}
                        </Button>
                    </Tooltip>
                    <Tooltip content="스크립트 수정">
                        <Button variant="ghost" size="sm" aria-label="스크립트 수정" onclick={() => onedit(script)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path
                                    d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
                                />
                            </svg>
                        </Button>
                    </Tooltip>
                    <Tooltip content="스크립트 삭제">
                        <Button
                            variant="ghost"
                            size="sm"
                            aria-label="스크립트 삭제"
                            onclick={() => handleDelete(script)}
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                aria-hidden="true"
                            >
                                <path
                                    d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                                />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                        </Button>
                    </Tooltip>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .empty-msg {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        text-align: center;
        padding: var(--space-lg) var(--space-md);
        margin: 0;
        line-height: 1.5;
    }

    .script-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .script-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-sm);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        gap: var(--space-sm);
    }

    .script-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
    }

    .script-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .script-name {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .script-name.disabled {
        opacity: 0.5;
    }

    .script-patterns {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .script-actions {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
    }

    /* Toggle switch */
    .toggle-switch {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
        flex-shrink: 0;
    }

    .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--color-disabled);
        transition: background-color var(--transition-normal);
        border-radius: 18px;
    }

    .toggle-slider::before {
        content: '';
        position: absolute;
        height: 14px;
        width: 14px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: transform var(--transition-normal);
        border-radius: 50%;
    }

    .toggle-switch input:checked + .toggle-slider {
        background-color: var(--color-primary);
    }

    .toggle-switch input:checked + .toggle-slider::before {
        transform: translateX(14px);
    }
</style>
