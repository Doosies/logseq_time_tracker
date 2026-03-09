<script lang="ts">
    import { getContext } from 'svelte';
    import { Button, Section } from '@personal/uikit';
    import { getCurrentTab, updateTabUrl, executeScript, executeMainWorldScript } from '#services/tab_service';
    import { switchV3TestServer, switchV5TestServer, debugAndGetPageInfo } from '#services/page_actions';
    import { buildDevUrl } from '#services/url_service.js';
    import { keyboardShortcut } from '../../actions/keyboard_shortcut';

    const toast = getContext<{ show: (message: string) => void }>('toast');

    async function handleV5Local(): Promise<void> {
        try {
            const tab = await getCurrentTab();
            if (!tab?.url?.includes('ecount') || !tab.id) {
                toast?.show('ecount.com 페이지에서 실행해주세요.');
                return;
            }
            await executeScript(tab.id, switchV5TestServer as (...args: never[]) => void);
            window.close();
        } catch {
            toast?.show('5.0 로컬 전환에 실패했습니다.');
        }
    }

    async function handleV3Local(): Promise<void> {
        try {
            const tab = await getCurrentTab();
            if (!tab?.url?.includes('ecount') || !tab.id) {
                toast?.show('ecount.com 페이지에서 실행해주세요.');
                return;
            }
            await executeScript(tab.id, switchV3TestServer as (...args: never[]) => void);
            window.close();
        } catch {
            toast?.show('3.0 로컬 전환에 실패했습니다.');
        }
    }

    async function handleDevMode(): Promise<void> {
        try {
            const tab = await getCurrentTab();
            if (!tab?.url?.includes('ecount') || !tab.id) {
                toast?.show('ecount.com 페이지에서 실행해주세요.');
                return;
            }

            const page_info = await executeMainWorldScript(tab.id, debugAndGetPageInfo);

            if (!page_info) {
                toast?.show('페이지에서 정보를 가져오는데 실패했습니다.');
                return;
            }

            const current_url = new URL(tab.url);
            const new_url = buildDevUrl(current_url, page_info);
            await updateTabUrl(tab.id, new_url.href);
        } catch {
            toast?.show('disableMin 적용에 실패했습니다.');
        }
    }
</script>

<svelte:window
    use:keyboardShortcut={[
        { key: '5', ctrl: true, handler: handleV5Local },
        { key: '3', ctrl: true, handler: handleV3Local },
        { key: 'd', ctrl: true, handler: handleDevMode },
    ]}
/>

<Section.Root>
    <Section.Header>
        <Section.Title>빠른 실행</Section.Title>
    </Section.Header>
    <Section.Content>
        <div class="action-bar-inner">
            <Button variant="secondary" onclick={handleV5Local}>5.0로컬</Button>
            <Button variant="secondary" onclick={handleV3Local}>3.0로컬</Button>
            <Button variant="secondary" onclick={handleDevMode}>disableMin</Button>
        </div>
    </Section.Content>
</Section.Root>

<style>
    .action-bar-inner {
        display: flex;
        gap: var(--space-sm);
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-sm);
    }

    .action-bar-inner :global(button) {
        flex: 1;
        white-space: nowrap;
    }
</style>
