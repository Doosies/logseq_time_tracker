<script lang="ts">
    import type { LoginAccount } from '#types/server';
    import { Section, Button, ButtonGroup } from '@personal/uikit';
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
    <ButtonGroup>
        {#each accounts as account (account.company + '§' + account.id)}
            <Button variant="primary" size="sm" onclick={() => handleLogin(account)}>
                {account.company} / {account.id}
            </Button>
        {/each}
    </ButtonGroup>
</Section>
