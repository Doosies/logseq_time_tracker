<script lang="ts">
    import { Section, Button } from '@personal/uikit';
    import { getCurrentTab, executeScript } from '@/services';
    import { fillLoginForm } from '@/services/page_actions';

    // 환경 변수에서 계정 정보 로드
    interface LoginAccount {
        company: string;
        id: string;
        password: string;
    }

    const login_accounts: LoginAccount[] = (() => {
        try {
            const accounts_json = import.meta.env.VITE_LOGIN_ACCOUNTS;
            if (!accounts_json) {
                console.warn('VITE_LOGIN_ACCOUNTS 환경 변수가 설정되지 않았습니다.');
                return [];
            }
            return JSON.parse(accounts_json) as LoginAccount[];
        } catch (error) {
            console.error('계정 정보 파싱 실패:', error);
            return [];
        }
    })();

    async function handleQuickLogin(account: LoginAccount) {
        const tab = await getCurrentTab();
        if (!tab?.id) return;

        await executeScript(tab.id, () => {
            const fill = fillLoginForm;
            fill('COMPANY', 'USER', 'PASS');
        });

        // 실제 값으로 스크립트 실행
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: fillLoginForm,
            args: [account.company, account.id, account.password],
        });
    }
</script>

<Section title="Quick Login">
    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
        {#each login_accounts as account}
            <Button
                variant="accent"
                size="sm"
                onclick={() => handleQuickLogin(account)}
            >
                {account.company} / {account.id}
            </Button>
        {/each}
    </div>
</Section>
