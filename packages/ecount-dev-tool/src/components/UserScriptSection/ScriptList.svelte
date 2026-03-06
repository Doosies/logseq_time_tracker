<script lang="ts">
    import type { UserScript } from '#types/user_script';
    import { Button } from '@personal/uikit';
    import { getScripts, toggleScript, deleteScript } from '#stores/user_scripts.svelte';
    import { executeUserScript } from '#services/script_executor';
    import { getTabState } from '#stores/current_tab.svelte';

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
        setTimeout(() => {
            run_status = { ...run_status, [script.id]: null };
        }, 2000);
    }

    async function handleDelete(script: UserScript): Promise<void> {
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
    <p class="empty-msg">등록된 스크립트가 없습니다.</p>
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
                    <Button variant="ghost" size="sm" onclick={() => handleRun(script)}>
                        {#if run_status[script.id] === 'success'}
                            ✓
                        {:else if run_status[script.id] === 'error'}
                            ✗
                        {:else}
                            ▶
                        {/if}
                    </Button>
                    <Button variant="ghost" size="sm" onclick={() => onedit(script)}>✏</Button>
                    <Button variant="ghost" size="sm" onclick={() => handleDelete(script)}>🗑</Button>
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
        padding: var(--space-lg) 0;
        margin: 0;
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
