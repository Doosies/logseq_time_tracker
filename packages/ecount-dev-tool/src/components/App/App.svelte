<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Dnd, Toast } from '@personal/uikit';
    import { StageManager } from '#components/StageManager';
    import { SectionSettings } from '#components/SectionSettings';
    import { SECTION_REGISTRY, getSectionById } from '#sections';
    import { initializeTabState, getTabState } from '#stores/current_tab.svelte';
    import { initializeAccounts } from '#stores/accounts.svelte';
    import { initializeActiveAccount } from '#stores/active_account.svelte';
    import { initializeVisibility, isSectionVisible } from '#stores/section_visibility.svelte';
    import { initializeSectionOrder, getSectionOrder, setSectionOrder } from '#stores/section_order.svelte';
    import { initializeUserScripts } from '#stores/user_scripts.svelte';
    import { initializePreferences } from '#stores/preferences.svelte';
    import { initializeTheme } from '#stores/theme.svelte';
    import { initializeSetupState, isFirstLaunch, markSetupCompleted } from '#stores/setup_state.svelte';
    import { DEFAULT_SETTINGS } from '#constants/default_settings';
    import { readBackupFile, importFromPayload } from '#services/backup_service';

    interface DndSectionItem {
        id: string;
        section_type: string;
    }

    const SECTION_LIST = $derived(SECTION_REGISTRY.map((s) => ({ id: s.id, label: s.label })));

    const tab = $derived(getTabState());
    const section_order = $derived(getSectionOrder());

    const visible_ordered_sections = $derived(section_order.filter((id) => isSectionVisible(id)));

    const sections_to_render = $derived(
        tab.is_stage ? visible_ordered_sections.filter((id) => id === 'quick-login') : visible_ordered_sections,
    );

    // DnD needs $state for handleReorder mutation; $effect syncs from sections_to_render
    // eslint-disable-next-line svelte/prefer-writable-derived
    let dnd_sections = $state<DndSectionItem[]>([]);

    const is_dnd_available = $derived(!tab.is_loading && !tab.is_stage && dnd_sections.length > 1);

    let first_launch = $derived(isFirstLaunch());
    let import_file_input = $state<HTMLInputElement | undefined>(undefined);
    let is_importing = $state(false);
    let import_result_message = $state('');

    $effect(() => {
        dnd_sections = sections_to_render.map((id) => ({ id, section_type: id }));
    });

    async function handleReorder(new_sections: DndSectionItem[]): Promise<void> {
        dnd_sections = new_sections;
        const new_visible_order = new_sections.map((s) => s.id);
        const hidden_sections = section_order.filter((id) => !isSectionVisible(id));
        await setSectionOrder([...new_visible_order, ...hidden_sections]);
    }

    function handleFirstLaunchImport(): void {
        import_file_input?.click();
    }

    async function handleFirstLaunchFileChange(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        is_importing = true;
        import_result_message = '';

        const result = await readBackupFile(file);
        is_importing = false;

        if (result.success) {
            import_result_message = '설정을 성공적으로 가져왔습니다!';
            await markSetupCompleted();
        } else {
            import_result_message = result.errors.join(', ') || '설정 가져오기에 실패했습니다.';
        }

        input.value = '';
    }

    async function handleSkipImport(): Promise<void> {
        await markSetupCompleted();
    }

    async function handleUseDefaults(): Promise<void> {
        is_importing = true;
        import_result_message = '';
        const result = await importFromPayload(DEFAULT_SETTINGS);
        is_importing = false;
        if (result.success) {
            import_result_message = '기본 설정을 적용했습니다!';
            await markSetupCompleted();
        } else {
            import_result_message = result.errors.join(', ') || '기본 설정 적용에 실패했습니다.';
        }
    }

    onMount(async () => {
        await initializeSetupState();
        await initializeTheme();
        initializeTabState();
        initializeAccounts();
        initializeActiveAccount();
        initializeVisibility();
        initializeSectionOrder();
        initializeUserScripts();
        await initializePreferences();
    });
</script>

<Toast.Provider duration={2500}>
    <Card.Root>
        <div class="app-content">
            {#if first_launch}
                <div class="first-launch-panel">
                    <div class="first-launch-icon">
                        <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                            <path
                                d="M8.5 6a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 9.793V6z"
                            />
                            <path
                                d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"
                            />
                        </svg>
                    </div>
                    <h3 class="first-launch-title">설정 가져오기</h3>
                    <p class="first-launch-desc">
                        이전에 내보낸 설정 파일이 있다면<br />선택하여 설정을 복원할 수 있습니다.
                    </p>

                    {#if import_result_message}
                        <p class="import-result">{import_result_message}</p>
                    {/if}

                    <div class="first-launch-actions">
                        <button
                            type="button"
                            class="btn-primary"
                            onclick={handleFirstLaunchImport}
                            disabled={is_importing}
                        >
                            {is_importing ? '가져오는 중...' : '파일에서 가져오기'}
                        </button>
                        <button type="button" class="btn-primary" onclick={handleUseDefaults} disabled={is_importing}>
                            기본값 사용
                        </button>
                        <button type="button" class="btn-secondary" onclick={handleSkipImport} disabled={is_importing}>
                            빈값으로 시작
                        </button>
                    </div>

                    <input
                        type="file"
                        accept=".json"
                        class="hidden-input"
                        bind:this={import_file_input}
                        onchange={handleFirstLaunchFileChange}
                        aria-hidden="true"
                    />
                </div>
            {:else}
                <SectionSettings sections={SECTION_LIST} />

                {#if tab.is_loading}
                    <div class="loading-container">
                        <div class="spinner"></div>
                        <p>로딩 중...</p>
                    </div>
                {:else if tab.is_stage}
                    {#each sections_to_render as section_id (section_id)}
                        {@const section = getSectionById(section_id)}
                        {#if section}
                            <section.component />
                        {/if}
                    {/each}
                    <div class="section-divider"></div>
                    <StageManager />
                {:else if is_dnd_available}
                    <Dnd.Provider items={dnd_sections} onreorder={handleReorder} class="sections-dnd-container">
                        {#each dnd_sections as item, index (item.id)}
                            <Dnd.Sortable id={item.id} {index}>
                                {#snippet children({
                                    handleAttach,
                                }: {
                                    handleAttach: (node: HTMLElement) => () => void;
                                })}
                                    {@const section = getSectionById(item.section_type)}
                                    <div class="section-wrapper">
                                        <div
                                            class="drag-handle-bar"
                                            data-drag-handle
                                            role="button"
                                            tabindex="-1"
                                            aria-label="드래그하여 섹션 순서 변경"
                                            title="드래그하여 순서 변경"
                                            {@attach handleAttach}
                                        >
                                            <span class="grip-dots"></span>
                                        </div>
                                        {#if section}
                                            <section.component />
                                        {/if}
                                    </div>
                                {/snippet}
                            </Dnd.Sortable>
                        {/each}
                    </Dnd.Provider>
                {:else}
                    <div class="sections-dnd-container">
                        {#each dnd_sections as item (item.id)}
                            {@const section = getSectionById(item.section_type)}
                            <div class="section-wrapper">
                                {#if section}
                                    <section.component />
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/if}
            {/if}
        </div>
    </Card.Root>
    <Toast.Root />
</Toast.Provider>

<style>
    .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-lg);
        gap: var(--space-sm);
    }

    .spinner {
        width: 24px;
        height: 24px;
        border: 3px solid var(--color-border);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .loading-container p {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        margin: 0;
    }

    .app-content {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .app-content > :global(*:not(.settings-root)) {
        width: 100%;
    }

    .section-divider {
        border-top: 1px solid var(--color-border);
        margin: var(--space-lg) 0;
        opacity: 0.5;
    }

    :global(.sections-dnd-container) {
        display: flex;
        flex-direction: column;
    }

    :global(.section-wrapper) {
        position: relative;
        border-radius: var(--radius-md, 8px);
        border: 1px solid transparent;
        padding: var(--space-sm, 4px);
        transition:
            background-color var(--transition-normal, 0.15s ease),
            border-color var(--transition-normal, 0.15s ease);
    }

    :global(.section-wrapper:hover) {
        background-color: var(--color-disabled, #f1f5f9);
        border-color: var(--color-border, #e2e8f0);
    }

    :global(.section-wrapper + .section-wrapper) {
        margin-top: var(--space-sm);
    }

    :global(.drag-handle-bar:hover) {
        opacity: 0.7;
        background-color: var(--color-surface, #f8fafc);
        color: var(--color-primary, #2563eb);
    }

    :global(.drag-handle-bar) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 3px 0;
        margin-bottom: var(--space-xs, 2px);
        color: var(--color-text-secondary, #64748b);
        background: none;
        border: none;
        border-radius: var(--radius-sm, 6px);
        opacity: 0.5;
        transition:
            opacity var(--transition-normal, 0.15s ease),
            background-color var(--transition-normal, 0.15s ease),
            color var(--transition-normal, 0.15s ease);
        user-select: none;
        cursor: grab;
    }

    :global(.drag-handle-bar)::before,
    :global(.drag-handle-bar)::after {
        content: '';
        flex: 1;
        height: 1px;
        background: currentColor;
        opacity: 0.4;
    }

    :global(.drag-handle-bar)::before {
        margin-right: var(--space-sm, 4px);
    }

    :global(.drag-handle-bar)::after {
        margin-left: var(--space-sm, 4px);
    }

    :global(.drag-handle-bar:active) {
        opacity: 1;
        cursor: grabbing;
    }

    :global(.grip-dots) {
        width: 14px;
        height: 8px;
        background-image: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
        background-repeat: repeat;
        background-size: 4px 4px;
        background-position:
            0 0,
            4px 0,
            8px 0;
        display: block;
        flex-shrink: 0;
    }

    .first-launch-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--space-xl) var(--space-lg);
        text-align: center;
        gap: var(--space-sm);
    }

    .first-launch-icon {
        color: var(--color-primary);
        margin-bottom: var(--space-sm);
    }

    .first-launch-title {
        font-size: var(--font-size-md);
        font-weight: var(--font-weight-semibold);
        color: var(--color-text);
        margin: 0;
    }

    .first-launch-desc {
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        margin: 0;
        line-height: 1.5;
    }

    .import-result {
        font-size: var(--font-size-sm);
        color: var(--color-primary);
        margin: 0;
    }

    .first-launch-actions {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-sm);
        margin-top: var(--space-md);
        width: 100%;
    }

    .btn-primary {
        padding: var(--space-sm) var(--space-lg);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        color: white;
        background-color: var(--color-primary);
        border: none;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }

    .btn-primary:hover:not(:disabled) {
        opacity: 0.9;
    }

    .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-secondary {
        padding: var(--space-sm) var(--space-lg);
        font-size: var(--font-size-sm);
        color: var(--color-text-secondary);
        background: transparent;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: background-color var(--transition-fast);
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: var(--color-surface);
    }

    .btn-secondary:disabled {
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
</style>
