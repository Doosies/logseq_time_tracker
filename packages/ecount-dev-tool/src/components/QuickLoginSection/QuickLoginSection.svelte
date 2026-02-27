<script lang="ts">
    import type { LoginAccount } from '#types/server';
    import { Section, Button, TextInput, Dnd } from '@personal/uikit';
    import { executeScript } from '#services/tab_service';
    import { inputLogin } from '#services/page_actions';
    import { getTabState } from '#stores/current_tab.svelte';
    import {
        getAccounts,
        addAccount,
        updateAccount,
        removeAccount,
        reorderAccounts,
        restoreAccounts,
        getAccountsSnapshot,
        isDuplicate,
        getAccountKey,
    } from '#stores/accounts.svelte';
    import { isActiveAccount, setActiveAccount } from '#stores/active_account.svelte';

    interface DndAccountItem {
        id: string;
        account: LoginAccount;
    }

    let is_editing = $state(false);
    let is_submitting = $state(false);
    let error_message = $state('');
    let error_timer: ReturnType<typeof setTimeout> | undefined;
    let new_company = $state('');
    let new_id = $state('');
    let new_password = $state('');
    let editing_index: number | null = $state(null);
    let accounts_snapshot = $state<LoginAccount[]>([]);

    const accounts = $derived(getAccounts());
    const tab = $derived(getTabState());

    let dnd_items = $state<DndAccountItem[]>([]);

    function syncDndItems(): void {
        dnd_items = getAccounts().map((a) => ({
            id: getAccountKey(a),
            account: a,
        }));
    }

    const DRAG_ACTIVATION_DISTANCE = 5;

    const can_add = $derived(
        !is_submitting && new_company.trim() !== '' && new_id.trim() !== '' && new_password.trim() !== '',
    );

    function resetForm(): void {
        editing_index = null;
        new_company = '';
        new_id = '';
        new_password = '';
    }

    function handleLogin(account: LoginAccount): void {
        if (is_editing) return;
        const key = `${account.company}§${account.id}`;
        executeScript(tab.tab_id, inputLogin as (...args: never[]) => void, [key, account.password]);
        setActiveAccount(account);
    }

    function showError(message: string): void {
        clearTimeout(error_timer);
        error_message = message;
        error_timer = setTimeout(() => {
            error_message = '';
        }, 2500);
    }

    async function handleAdd(): Promise<void> {
        if (!can_add) return;
        if (isDuplicate({ company: new_company.trim(), id: new_id.trim(), password: '' })) {
            showError('이미 등록된 계정입니다.');
            return;
        }
        is_submitting = true;
        try {
            const success = await addAccount({
                company: new_company.trim(),
                id: new_id.trim(),
                password: new_password.trim(),
            });
            if (success) {
                resetForm();
                syncDndItems();
            } else {
                showError('저장에 실패했습니다.');
            }
        } finally {
            is_submitting = false;
        }
    }

    async function handleUpdate(): Promise<void> {
        if (!can_add || editing_index === null) return;
        const trimmed_account: LoginAccount = {
            company: new_company.trim(),
            id: new_id.trim(),
            password: new_password.trim(),
        };
        const current = getAccounts();
        const has_dup = current.some(
            (a, i) => i !== editing_index && a.company === trimmed_account.company && a.id === trimmed_account.id,
        );
        if (has_dup) {
            showError('이미 등록된 계정입니다.');
            return;
        }
        is_submitting = true;
        try {
            const success = await updateAccount(editing_index, trimmed_account);
            if (success) {
                resetForm();
                syncDndItems();
            } else {
                showError('수정에 실패했습니다.');
            }
        } finally {
            is_submitting = false;
        }
    }

    function handleAccountCellClick(index: number, account: LoginAccount): void {
        if (editing_index === index) {
            resetForm();
            return;
        }
        editing_index = index;
        new_company = account.company;
        new_id = account.id;
        new_password = account.password;
    }

    async function handleRemove(index: number): Promise<void> {
        await removeAccount(index);
        syncDndItems();
        if (editing_index === index) {
            resetForm();
        } else if (editing_index !== null && editing_index > index) {
            editing_index = editing_index - 1;
        }
    }

    async function handleDndReorder(new_items: DndAccountItem[]): Promise<void> {
        dnd_items = new_items;
        await reorderAccounts(new_items.map((i) => i.account));
        if (editing_index !== null) {
            resetForm();
        }
    }

    function toggleEdit(): void {
        is_editing = !is_editing;
        if (is_editing) {
            accounts_snapshot = getAccountsSnapshot();
            syncDndItems();
        } else {
            resetForm();
        }
    }

    async function handleCancel(): Promise<void> {
        const ok = await restoreAccounts(accounts_snapshot);
        if (ok) {
            syncDndItems();
        } else {
            showError('복원에 실패했습니다.');
        }
        is_editing = false;
        resetForm();
    }

    function handleApply(): void {
        is_editing = false;
        resetForm();
    }
</script>

<Section.Root>
    <Section.Header>
        <Section.Title>빠른 로그인</Section.Title>
        <Section.Action>
            {#if is_editing}
                <div class="edit-actions">
                    <button class="cancel-btn" type="button" onclick={handleCancel}>취소</button>
                    <button class="apply-btn" type="button" onclick={handleApply}>적용</button>
                </div>
            {:else}
                <button class="edit-toggle" type="button" onclick={toggleEdit}>편집</button>
            {/if}
        </Section.Action>
    </Section.Header>
    <Section.Content>
        <div class="account-scroll {is_editing ? 'editing' : ''}">
            {#if accounts.length === 0 && !is_editing}
                <p class="empty-msg">편집 버튼을 눌러 계정을 추가하세요</p>
            {/if}

            {#if is_editing}
                <Dnd.Provider
                    items={dnd_items}
                    onreorder={handleDndReorder}
                    class="account-grid editing"
                    activation_distance={DRAG_ACTIVATION_DISTANCE}
                >
                    {#each dnd_items as item, i (item.id)}
                        <Dnd.Sortable id={item.id} index={i}>
                            {#snippet children({ handleAttach })}
                                <div
                                    class="account-cell-wrap jiggle {editing_index === i ? 'editing' : ''}"
                                    style="animation-delay: {(i % 5) * -0.15}s"
                                    role="button"
                                    tabindex="0"
                                    onclick={() => handleAccountCellClick(i, item.account)}
                                    onkeydown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleAccountCellClick(i, item.account);
                                        }
                                    }}
                                >
                                    <span
                                        data-drag-handle
                                        aria-label="드래그하여 계정 순서 변경"
                                        {@attach handleAttach}
                                    >
                                        ⠿
                                    </span>
                                    <button
                                        class="remove-btn"
                                        onclick={(e) => {
                                            e.stopPropagation();
                                            handleRemove(i);
                                        }}
                                    >
                                        &times;
                                    </button>
                                    <span class="account-code">{item.account.company}</span>
                                    <span class="account-name">{item.account.id}</span>
                                </div>
                            {/snippet}
                        </Dnd.Sortable>
                    {/each}
                </Dnd.Provider>
            {:else}
                <div class="account-grid">
                    {#each accounts as account (getAccountKey(account))}
                        <Button
                            variant="primary"
                            class="account-cell {isActiveAccount(account) ? 'active' : ''}"
                            onclick={() => handleLogin(account)}
                        >
                            <span class="account-code">{account.company}</span>
                            <span class="account-name">{account.id}</span>
                        </Button>
                    {/each}
                </div>
            {/if}
        </div>

        {#if is_editing}
            <div class="add-form">
                <TextInput bind:value={new_company} placeholder="회사코드" />
                <TextInput bind:value={new_id} placeholder="아이디" />
                <TextInput bind:value={new_password} placeholder="비밀번호" />
                <Button
                    variant="primary"
                    size="sm"
                    disabled={!can_add}
                    onclick={editing_index !== null ? handleUpdate : handleAdd}
                >
                    {editing_index !== null ? '수정' : '추가'}
                </Button>
            </div>
            {#if error_message}
                <p class="error-msg">{error_message}</p>
            {/if}
        {/if}
    </Section.Content>
</Section.Root>

<style>
    .edit-toggle {
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-primary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        padding: var(--space-xs) var(--space-sm);
        transition:
            background-color var(--transition-normal),
            color var(--transition-normal);
    }

    .edit-toggle:hover {
        background-color: var(--color-surface);
        color: var(--color-primary-hover);
    }

    .edit-toggle:active {
        background-color: var(--color-border);
    }

    .edit-actions {
        display: flex;
        gap: var(--space-xs);
        align-items: center;
    }

    .cancel-btn {
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        padding: var(--space-xs) var(--space-sm);
        transition:
            background-color var(--transition-normal),
            color var(--transition-normal);
    }

    .cancel-btn:hover {
        background-color: var(--color-surface);
        color: var(--color-text);
    }

    .apply-btn {
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        color: var(--color-primary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        padding: var(--space-xs) var(--space-sm);
        transition:
            background-color var(--transition-normal),
            color var(--transition-normal);
    }

    .apply-btn:hover {
        background-color: var(--color-surface);
        color: var(--color-primary-hover);
    }

    .apply-btn:active {
        background-color: var(--color-border);
    }

    .account-scroll {
        min-height: calc(2 * 3.5em + 1 * var(--space-lg));
        max-height: calc(3 * 3.5em + 2 * var(--space-lg));
        overflow-y: auto;
        scrollbar-gutter: stable;
        scrollbar-width: thin;
        scrollbar-color: var(--color-border) transparent;
        contain: content;
    }

    .account-scroll.editing {
        max-height: none;
        overflow: visible;
        padding: var(--space-sm);
    }

    .empty-msg {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        text-align: center;
        padding: var(--space-lg) 0;
    }

    /* --- Grid (shared normal + edit) --- */

    :global(.account-grid) {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(4.5em, 1fr));
        grid-auto-rows: 3.5em;
        gap: var(--space-lg);
    }

    .account-grid :global(.account-cell) {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-width: 0;
        height: 100%;
        padding: 0 var(--space-sm);
        margin: 0;
    }

    .account-grid :global(.account-cell.active) {
        outline: 2px solid var(--color-primary);
        outline-offset: -2px;
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 25%, transparent);
    }

    .account-code {
        font-size: var(--font-size-xs);
        line-height: 1.1;
        letter-spacing: 0.03em;
        overflow-wrap: break-word;
        word-break: break-word;
    }

    .account-name {
        font-size: var(--font-size-md);
        line-height: 1.1;
        font-weight: var(--font-weight-bold);
        overflow-wrap: break-word;
        word-break: break-word;
    }

    /* --- Edit mode: jiggle cells --- */

    :global(.account-grid.editing) :global(.dnd-sortable) {
        height: 100%;
    }

    :global(.account-cell-wrap) {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 0;
        height: 100%;
        padding: 0 var(--space-sm);
        margin: 0;
        background-color: var(--color-primary);
        color: var(--color-background);
        border-radius: var(--radius-md);
        cursor: grab;
        user-select: none;
    }

    :global(.account-cell-wrap:active) {
        cursor: grabbing;
    }

    @keyframes jiggle {
        0% {
            transform: rotate(-1.5deg);
        }
        25% {
            transform: rotate(1deg);
        }
        50% {
            transform: rotate(-1deg);
        }
        75% {
            transform: rotate(1.5deg);
        }
        100% {
            transform: rotate(-1.5deg);
        }
    }

    :global(.jiggle) {
        animation: jiggle 0.4s ease-in-out infinite;
    }

    :global(.account-cell-wrap[data-dragging]) {
        animation: none;
    }

    :global(.account-cell-wrap) :global([data-drag-handle]) {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        opacity: 0;
        z-index: var(--z-index-above);
        font-size: 0;
    }

    :global(.account-cell-wrap) :global([data-drag-handle]:active) {
        cursor: grabbing;
    }

    :global(.account-cell-wrap.editing) {
        outline: 2px solid var(--color-background);
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--color-primary);
    }

    .remove-btn {
        position: absolute;
        top: -4px;
        right: -4px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: none;
        background-color: var(--color-error);
        color: var(--color-background);
        font-size: 10px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
        z-index: var(--z-index-above);
        transition:
            transform var(--transition-fast),
            opacity var(--transition-normal);
    }

    .remove-btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 28px;
    }

    .remove-btn:hover {
        opacity: 0.85;
        transform: scale(1.2);
    }

    .remove-btn:active {
        transform: scale(0.9);
    }

    /* --- Common --- */

    .add-form {
        display: flex;
        gap: var(--space-xs);
        margin-top: var(--space-sm);
        align-items: center;
        width: 100%;
    }

    .add-form :global(div) {
        flex: 1;
        min-width: 0;
    }

    .error-msg {
        margin: var(--space-xs) 0 0;
        font-size: var(--font-size-sm);
        color: var(--color-error);
        font-weight: var(--font-weight-medium);
        overflow-wrap: break-word;
    }
</style>
