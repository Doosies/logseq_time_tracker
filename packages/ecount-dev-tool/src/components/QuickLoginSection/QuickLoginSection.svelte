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
        min-height: calc(5 * 3em + 4 * 4px);
        max-height: calc(5 * 3em + 4 * 4px);
        overflow-y: auto;
    }

    .account-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: 3em;
        gap: 4px;
    }

    .account-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 0 4px;
        border: none;
        border-radius: 4px;
        background-color: #1e3a5f;
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.15s ease;
    }

    .account-btn:hover {
        background-color: #162d4a;
    }

    .account-btn:active {
        background-color: #0f2035;
    }

    .account-code {
        font-size: 12px;
        line-height: 1.1;
        opacity: 0.8;
    }

    .account-name {
        font-size: 13px;
        line-height: 1.1;
        font-weight: 700;
    }
</style>
