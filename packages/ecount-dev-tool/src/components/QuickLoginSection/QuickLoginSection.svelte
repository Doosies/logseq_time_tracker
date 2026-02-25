<script lang="ts">
    import type { LoginAccount } from '#types/server';
    import { Section, Button, TextInput } from '@personal/uikit';
    import { executeScript } from '#services/tab_service';
    import { inputLogin } from '#services/page_actions';
    import { getTabState } from '#stores/current_tab.svelte';
    import { getAccounts, addAccount, removeAccount, isDuplicate } from '#stores/accounts.svelte';

    let is_editing = $state(false);
    let is_submitting = $state(false);
    let error_message = $state('');
    let error_timer: ReturnType<typeof setTimeout> | undefined;
    let new_company = $state('');
    let new_id = $state('');
    let new_password = $state('');

    const accounts = $derived(getAccounts());
    const tab = $derived(getTabState());

    const can_add = $derived(
        !is_submitting && new_company.trim() !== '' && new_id.trim() !== '' && new_password.trim() !== '',
    );

    function handleLogin(account: LoginAccount): void {
        if (is_editing) return;
        const key = `${account.company}§${account.id}`;
        executeScript(tab.tab_id, inputLogin as (...args: never[]) => void, [key, account.password]);
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
                new_company = '';
                new_id = '';
                new_password = '';
            } else {
                showError('저장에 실패했습니다.');
            }
        } finally {
            is_submitting = false;
        }
    }

    async function handleRemove(index: number): Promise<void> {
        await removeAccount(index);
    }

    function toggleEdit(): void {
        is_editing = !is_editing;
    }
</script>

<Section title="빠른 로그인">
    <div class="section-header">
        <button class="edit-toggle" onclick={toggleEdit}>
            {is_editing ? '완료' : '편집'}
        </button>
    </div>

    {#if is_editing}
        <div class="add-form">
            <TextInput bind:value={new_company} placeholder="회사코드" />
            <TextInput bind:value={new_id} placeholder="아이디" />
            <TextInput bind:value={new_password} placeholder="비밀번호" />
            <Button variant="primary" size="sm" disabled={!can_add} onclick={handleAdd}>추가</Button>
        </div>
        {#if error_message}
            <p class="error-msg">{error_message}</p>
        {/if}
    {/if}

    <div class="account-scroll">
        {#if accounts.length === 0 && !is_editing}
            <p class="empty-msg">편집 버튼을 눌러 계정을 추가하세요</p>
        {/if}
        <div class="account-grid">
            {#each accounts as account, i (i)}
                <!-- svelte-ignore a11y_no_static_element_interactions a11y_no_noninteractive_tabindex -->
                <div
                    class="account-btn"
                    class:editing={is_editing}
                    role="button"
                    tabindex="0"
                    onclick={() => handleLogin(account)}
                    onkeydown={(e) => {
                        if (e.key === 'Enter') handleLogin(account);
                    }}
                >
                    {#if is_editing}
                        <button
                            class="remove-btn"
                            onclick={(e) => {
                                e.stopPropagation();
                                handleRemove(i);
                            }}
                        >
                            &times;
                        </button>
                    {/if}
                    <span class="account-code">{account.company}</span>
                    <span class="account-name">{account.id}</span>
                </div>
            {/each}
        </div>
    </div>
</Section>

<style>
    .section-header {
        display: flex;
        justify-content: flex-end;
        margin-bottom: var(--space-xs);
    }

    .edit-toggle {
        background: none;
        border: none;
        color: var(--color-primary);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        padding: var(--space-xs) var(--space-sm);
    }

    .edit-toggle:hover {
        text-decoration: underline;
    }

    .account-scroll {
        min-height: calc(2 * 3.5em + 1 * var(--space-lg));
        max-height: calc(3 * 3.5em + 2 * var(--space-lg));
        overflow-y: auto;
        scrollbar-gutter: stable;
        scrollbar-width: thin;
        scrollbar-color: var(--color-border) transparent;
    }

    .empty-msg {
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
        text-align: center;
        padding: var(--space-lg) 0;
    }

    .account-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(4.5em, 1fr));
        grid-auto-rows: 3.5em;
        gap: var(--space-lg);
    }

    .account-btn {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        min-width: 0;
        height: 100%;
        padding: 0 var(--space-sm);
        border: none;
        border-radius: var(--radius-sm);
        background-color: var(--color-primary);
        color: #fff;
        font-weight: var(--font-weight-bold);
        cursor: pointer;
        transition: background-color 0.15s ease;
    }

    .account-btn:hover {
        background-color: var(--color-primary-hover);
    }

    .account-btn:active {
        background-color: var(--color-primary-active);
    }

    .account-btn.editing {
        cursor: default;
        opacity: 0.85;
    }

    .remove-btn {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: none;
        background-color: var(--color-error);
        color: #fff;
        font-size: 10px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding: 0;
    }

    .remove-btn:hover {
        opacity: 0.8;
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

    .add-form {
        display: flex;
        gap: var(--space-xs);
        margin-bottom: var(--space-sm);
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
