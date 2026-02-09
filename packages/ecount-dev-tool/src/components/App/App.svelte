<script lang="ts">
    import { onMount } from 'svelte';
    import { parsed_url, is_ecount_page, loadCurrentTab } from '@/stores';
    import { getCurrentTab, updateTabUrl, buildEc5Url, buildEc3Url } from '@/services';
    import { PopupLayout } from '../PopupLayout';
    import { QuickLoginSection } from '../QuickLoginSection';
    import { EnvironmentPanel } from '../EnvironmentPanel';
    import { ActionBar } from '../ActionBar';
    import type { ServerConfig } from '@/types';

    let server_config = $state<ServerConfig>({ v5_domain: '', v3_domain: '' });
    let current_stage = $state<string>('');

    onMount(async () => {
        await loadCurrentTab();
    });

    const handleServerChange = (config: ServerConfig) => {
        server_config = config;
    };

    const handleStageChange = (stage: string) => {
        current_stage = stage;
    };

    const handleApply = async () => {
        const tab = await getCurrentTab();
        if (!tab?.id || !tab.url || !$parsed_url) return;

        let new_url: string;

        if ($parsed_url.environment === 'stage') {
            // Stage 서버 변경
            new_url = tab.url.replace(
                /https:\/\/[^\/]+/,
                `https://${current_stage}.ecount.com`
            );
        } else if ($parsed_url.is_ec5) {
            // EC5 URL 빌드
            new_url = buildEc5Url(tab.url, server_config);
        } else if ($parsed_url.is_ec3) {
            // EC3 URL 빌드
            new_url = buildEc3Url(tab.url, server_config.v3_domain);
        } else {
            return;
        }

        await updateTabUrl(tab.id, new_url);
        window.close();
    };

    const handleClose = () => {
        window.close();
    };
</script>

{#if !$is_ecount_page}
    <PopupLayout>
        <div style="text-align: center; padding: 20px;">
            <p>This is not an ecount.com page.</p>
        </div>
    </PopupLayout>
{:else if $parsed_url}
    <PopupLayout>
        <QuickLoginSection />
        <EnvironmentPanel
            parsed_url={$parsed_url}
            onServerChange={handleServerChange}
            onStageChange={handleStageChange}
        />
        <ActionBar onApply={handleApply} onClose={handleClose} />
    </PopupLayout>
{/if}
