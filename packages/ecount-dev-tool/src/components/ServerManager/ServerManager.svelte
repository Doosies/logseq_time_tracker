<script lang="ts">
    import type { ParsedUrl } from '#types/server';
    import { Section, Button, ToggleInput } from '@personal/uikit';
    import { V5_SERVERS, V3_SERVERS } from '#constants/servers';
    import { buildEc5Url, buildEc3Url } from '#services/url_service';
    import { updateTabUrl } from '#services/tab_service';
    import { getTabState } from '#stores/current_tab.svelte';

    const tab = $derived(getTabState());
    const parsed = $derived(tab.parsed as ParsedUrl);

    let v5_value = $state('');
    let v3_value = $state('');
    let v5_text_mode = $state(false);
    let v3_text_mode = $state(false);

    $effect(() => {
        if (!parsed) return;

        if (parsed.v5_domain === 'test') {
            v5_text_mode = true;
            v5_value = 'test';
        } else {
            v5_value = parsed.v5_domain;
        }

        if (parsed.v3_domain === 'test') {
            v3_text_mode = true;
            v3_value = 'test';
        } else {
            v3_value = parsed.v3_domain;
        }
    });

    function handleToggleV5(): void {
        v5_text_mode = !v5_text_mode;
        if (v5_text_mode && parsed) {
            const server = parsed.current_server;
            if (server && server !== '=====') {
                v5_value = server + v5_value;
            } else {
                v5_value = '=====' + v5_value;
            }
        } else {
            v5_value = '';
        }
    }

    function handleToggleV3(): void {
        v3_text_mode = !v3_text_mode;
        if (v3_text_mode && parsed) {
            const server = parsed.current_server;
            if (server && server !== '=====') {
                v3_value = server + v3_value;
            } else {
                v3_value = '=====' + v3_value;
            }
        } else {
            v3_value = '';
        }
    }

    function handleChangeServer(): void {
        if (!parsed) return;

        const to_v5 = v5_text_mode ? v5_value : parsed.current_server + v5_value;
        const to_v3 = v3_text_mode ? v3_value : parsed.current_server + v3_value;

        let new_url: string;
        if (parsed.page_type === 'ec3') {
            new_url = buildEc3Url(parsed.url, to_v3, to_v5);
        } else {
            new_url = buildEc5Url(parsed.url, to_v5, to_v3);
        }

        updateTabUrl(tab.tab_id, new_url);
    }

    interface ServerManagerProps {
        collapsed?: boolean;
        onToggle?: (collapsed: boolean) => void;
    }

    let { collapsed = false, onToggle }: ServerManagerProps = $props();
</script>

<Section title="서버 관리" collapsible {collapsed} {onToggle}>
    <div class="server-panel">
        <div class="server-row">
            <span class="server-label">V5</span>
            <ToggleInput
                bind:value={v5_value}
                prefix={v5_text_mode ? '' : (parsed?.current_server ?? '')}
                options={V5_SERVERS}
                isTextMode={v5_text_mode}
                onToggle={handleToggleV5}
            />
        </div>
        <div class="server-row">
            <span class="server-label">V3</span>
            <ToggleInput
                bind:value={v3_value}
                prefix={v3_text_mode ? '' : (parsed?.current_server ?? '')}
                options={V3_SERVERS}
                isTextMode={v3_text_mode}
                onToggle={handleToggleV3}
            />
        </div>
    </div>
    <Button fullWidth onclick={handleChangeServer}>서버 적용</Button>
</Section>

<style>
    .server-panel {
        background-color: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        margin-bottom: var(--space-md);
    }

    .server-row {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }

    .server-row + .server-row {
        margin-top: var(--space-md);
    }

    .server-label {
        min-width: 28px;
        padding: 2px 6px;
        border-radius: var(--radius-sm);
        background-color: var(--color-border);
        color: var(--color-text-secondary);
        font-size: var(--font-size-xs);
        font-weight: var(--font-weight-bold);
        text-align: center;
        flex-shrink: 0;
    }
</style>
