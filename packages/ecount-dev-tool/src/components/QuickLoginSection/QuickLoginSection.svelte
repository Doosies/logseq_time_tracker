<script lang="ts">
    import type { LoginAccount } from '#types/server';
    import { Section } from '@personal/uikit';
    import { executeScript } from '#services/tab_service';
    import { inputLogin } from '#services/page_actions';
    import { getTabState } from '#stores/current_tab.svelte';

    const raw_accounts = import.meta.env.VITE_LOGIN_ACCOUNTS ?? '[]';
    const accounts: LoginAccount[] = JSON.parse(raw_accounts);

    const tab = $derived(getTabState());

    function handleLogin(account: LoginAccount): void {
        const key = `${account.company}§${account.id}`;
        executeScript(tab.tab_id, inputLogin as (...args: never[]) => void, [key, account.password]);
    }
</script>

<Section title="Quick Login Setting">
    <div class="account-scroll">
        <div class="account-grid">
            {#each accounts as account (account.company + '§' + account.id)}
                <button class="account-btn" onclick={() => handleLogin(account)}>
                    <span class="account-code">{account.company}</span>
                    <span class="account-name">{account.id}</span>
                </button>
            {/each}
        </div>
    </div>
</Section>

<style>
    .account-scroll {
        min-height: calc(5 * 3em + 4 * var(--space-sm));
        max-height: calc(5 * 3em + 4 * var(--space-sm));
        overflow-y: auto;
    }

    .account-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: 3em;
        gap: var(--space-sm);
    }

    .account-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
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

    .account-code {
        font-size: var(--font-size-sm);
        line-height: 1.1;
        opacity: 0.8;
    }

    .account-name {
        font-size: var(--font-size-md);
        line-height: 1.1;
        font-weight: var(--font-weight-bold);
    }
</style>
