<script lang="ts">
    import { getContext } from 'svelte';
    import { Popover, CheckboxList } from '@personal/uikit';
    import { isSectionVisible, toggleVisibility } from '#stores/section_visibility.svelte';
    import { getSectionOrder, setSectionOrder, moveSectionUp, moveSectionDown } from '#stores/section_order.svelte';
    import { downloadBackup, readBackupFile, resetAllSettings } from '#services/backup_service';

    interface ToastContext {
        show: (message: string) => void;
    }

    const toast_ctx = getContext<ToastContext>('toast');

    interface SectionItem {
        id: string;
        label: string;
    }

    interface SectionSettingsProps {
        sections: SectionItem[];
    }

    let { sections }: SectionSettingsProps = $props();

    let dnd_items = $state<SectionItem[]>([]);
    let file_input: HTMLInputElement | undefined;
    let is_importing = $state(false);
    let is_resetting = $state(false);
    let show_reset_confirm = $state(false);

    const all_ids = $derived(sections.map((s) => s.id));
    const visible_count = $derived(all_ids.filter((id) => isSectionVisible(id)).length);

    $effect(() => {
        const order = getSectionOrder();
        const section_map = new Map(sections.map((s) => [s.id, s]));
        dnd_items = order.map((id) => section_map.get(id)).filter((s): s is SectionItem => s !== undefined);
    });

    async function handleItemToggle(section_id: string): Promise<void> {
        await toggleVisibility(section_id, all_ids);
    }

    async function handleItemKeydown(event: KeyboardEvent, section_id: string): Promise<void> {
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            await moveSectionUp(section_id);
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            await moveSectionDown(section_id);
        }
    }

    async function handleReorder(new_items: SectionItem[]): Promise<void> {
        dnd_items = new_items;
        const new_order = new_items.map((item) => item.id);
        await setSectionOrder(new_order);
    }

    function handleExport(): void {
        downloadBackup();
    }

    function handleImportClick(): void {
        file_input?.click();
    }

    async function handleFileChange(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        is_importing = true;
        const result = await readBackupFile(file);
        is_importing = false;

        if (result.success) {
            toast_ctx?.show('설정을 성공적으로 가져왔습니다');
        } else {
            toast_ctx?.show(result.errors.join(', ') || '설정 가져오기 실패');
        }

        input.value = '';
    }

    function getItemAttrs(section: SectionItem, visible: boolean) {
        return {
            role: 'option' as const,
            tabindex: 0,
            'aria-selected': visible,
            'aria-label': `${section.label} - 드래그하여 순서 변경`,
            onkeydown: (e: KeyboardEvent) => handleItemKeydown(e, section.id),
        } as Record<string, unknown>;
    }

    async function handleResetAll(): Promise<void> {
        is_resetting = true;
        const result = await resetAllSettings();
        is_resetting = false;

        if (result.success) {
            try {
                await chrome.storage.local.remove('setup_completed');
            } catch {
                /* ignore */
            }
            window.location.reload();
        } else {
            toast_ctx?.show(result.errors.join(', ') || '초기화 실패');
        }
        show_reset_confirm = false;
    }
</script>

<Popover.Root class="settings-root">
    <Popover.Trigger aria-label="섹션 설정">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path
                d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
            />
            <path
                d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.902 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.116l.094-.318z"
            />
        </svg>
    </Popover.Trigger>
    <Popover.Content role="listbox" label="섹션 순서 및 표시 설정">
        <div class="panel-title">섹션 설정</div>
        <CheckboxList.Root items={dnd_items} onreorder={handleReorder} class="settings-list">
            {#snippet item({ item: section, handleAttach })}
                {@const visible = isSectionVisible(section.id)}
                {@const is_last_visible = visible && visible_count <= 1}
                <CheckboxList.Item
                    {handleAttach}
                    checked={visible}
                    disabled={is_last_visible}
                    ontoggle={() => handleItemToggle(section.id)}
                    class="settings-item {is_last_visible ? 'disabled' : ''}"
                    {...getItemAttrs(section, visible)}
                >
                    <span class="item-label">{section.label}</span>
                </CheckboxList.Item>
            {/snippet}
        </CheckboxList.Root>

        <div class="backup-section">
            <div class="backup-divider"></div>
            <div class="backup-title">데이터 백업</div>
            <div class="backup-buttons">
                <button
                    type="button"
                    class="backup-btn"
                    onclick={handleExport}
                    disabled={is_importing}
                    aria-label="설정 내보내기"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path
                            d="M8 2a.5.5 0 0 1 .5.5v8.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 1 1 .708-.708L7.5 10.293V2.5A.5.5 0 0 1 8 2z"
                        />
                    </svg>
                    <span>설정 내보내기</span>
                </button>
                <button
                    type="button"
                    class="backup-btn"
                    onclick={handleImportClick}
                    disabled={is_importing}
                    aria-label="설정 가져오기"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path
                            d="M8.5 6a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.793V6z"
                        />
                        <path
                            d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"
                        />
                    </svg>
                    <span>설정 가져오기</span>
                </button>
            </div>
            <input
                type="file"
                accept=".json"
                class="hidden-input"
                bind:this={file_input}
                onchange={handleFileChange}
                aria-hidden="true"
            />

            <div class="reset-section">
                <div class="backup-divider"></div>
                <div class="backup-title">설정 초기화</div>
                {#if show_reset_confirm}
                    <p class="reset-warning">모든 설정이 삭제됩니다. 계속하시겠습니까?</p>
                    <div class="backup-buttons">
                        <button type="button" class="reset-btn danger" onclick={handleResetAll} disabled={is_resetting}>
                            {is_resetting ? '초기화 중...' : '확인'}
                        </button>
                        <button
                            type="button"
                            class="backup-btn"
                            onclick={() => (show_reset_confirm = false)}
                            disabled={is_resetting}
                        >
                            취소
                        </button>
                    </div>
                {:else}
                    <div class="backup-buttons">
                        <button type="button" class="reset-btn" onclick={() => (show_reset_confirm = true)}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                                <path
                                    d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                                />
                                <path
                                    fill-rule="evenodd"
                                    d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                                />
                            </svg>
                            <span>전체 초기화</span>
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </Popover.Content>
</Popover.Root>

<style>
    :global(.settings-root) {
        position: relative;
        display: flex;
        justify-content: flex-end;
        margin-bottom: var(--space-xs);
        margin-left: auto;
        width: fit-content;
    }

    .panel-title {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        padding: var(--space-sm) var(--space-md);
        font-weight: var(--font-weight-medium);
        border-bottom: 1px solid var(--color-border);
    }

    :global(.settings-list) {
        padding: var(--space-xs) 0;
    }

    :global(.settings-item) {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-sm) var(--space-md);
        transition: background-color var(--transition-fast);
        outline: none;
    }

    :global(.settings-item:hover) {
        background-color: var(--color-surface);
    }

    :global(.settings-item:focus-visible) {
        background-color: var(--color-surface);
        box-shadow: inset 0 0 0 2px var(--color-primary);
    }

    :global(.settings-item.disabled) {
        opacity: 0.5;
    }

    :global(.settings-item.disabled:hover) {
        background-color: transparent;
    }

    :global(.settings-item) :global([data-drag-handle]) {
        cursor: grab;
    }

    :global(.settings-item) :global([data-drag-handle]:active) {
        cursor: grabbing;
    }

    :global(.settings-item:hover) :global([data-drag-handle]) {
        opacity: 0.8;
    }

    .item-label {
        font-size: var(--font-size-sm);
        color: var(--color-text);
        user-select: none;
    }

    .backup-section {
        padding: var(--space-sm) var(--space-md);
    }

    .backup-divider {
        height: 1px;
        background-color: var(--color-border);
        margin: var(--space-sm) 0;
    }

    .backup-title {
        font-size: var(--font-size-xs);
        color: var(--color-text-secondary);
        font-weight: var(--font-weight-medium);
        margin-bottom: var(--space-sm);
    }

    .backup-buttons {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
    }

    .backup-btn {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font-size: var(--font-size-sm);
        color: var(--color-text);
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        text-align: left;
    }

    .backup-btn:hover:not(:disabled) {
        background-color: var(--color-surface);
    }

    .backup-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .hidden-input {
        position: absolute;
        width: 0;
        height: 0;
        opacity: 0;
        pointer-events: none;
    }

    .reset-section {
        padding: var(--space-sm) var(--space-md);
    }

    .reset-warning {
        font-size: var(--font-size-xs);
        color: var(--color-error, #ef4444);
        margin: 0 0 var(--space-sm) 0;
    }

    .reset-btn {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        width: 100%;
        padding: var(--space-sm) var(--space-md);
        font-size: var(--font-size-sm);
        color: var(--color-text);
        background: transparent;
        border: none;
        border-radius: var(--radius-sm);
        cursor: pointer;
        transition: background-color var(--transition-fast);
        text-align: left;
    }

    .reset-btn:hover:not(:disabled) {
        background-color: var(--color-surface);
    }

    .reset-btn.danger {
        color: var(--color-error, #ef4444);
        font-weight: var(--font-weight-medium);
    }

    .reset-btn.danger:hover:not(:disabled) {
        background-color: rgba(239, 68, 68, 0.1);
    }

    .reset-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
