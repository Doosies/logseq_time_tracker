<script lang="ts">
    import type { ParsedUrl } from '#types/server';
    import { Section, Button, ToggleInput, TextInput, Select } from '@personal/uikit';
    import { V5_SERVERS, V3_SERVERS } from '#constants/servers';
    import { buildEc5Url, buildEc3Url } from '#services/url_service';
    import { updateTabUrl } from '#services/tab_service';
    import { getTabState } from '#stores/current_tab.svelte';
    import { server_ui, initializeServerUi } from '#stores/server_ui.svelte';

    const tab = $derived(getTabState());
    const parsed = $derived(tab.parsed as ParsedUrl);

    $effect(() => {
        if (!parsed) return;
        initializeServerUi(parsed);
    });

    function handleToggleV5(): void {
        if (server_ui.v5_text_mode && parsed) {
            const server = parsed.current_server;
            if (server && server !== '=====') {
                server_ui.v5_value = server + server_ui.v5_value;
            } else {
                server_ui.v5_value = '=====' + server_ui.v5_value;
            }
        } else {
            server_ui.v5_value = '';
        }
    }

    function handleToggleV3(): void {
        if (server_ui.v3_text_mode && parsed) {
            const server = parsed.current_server;
            if (server && server !== '=====') {
                server_ui.v3_value = server + server_ui.v3_value;
            } else {
                server_ui.v3_value = '=====' + server_ui.v3_value;
            }
        } else {
            server_ui.v3_value = '';
        }
    }

    function handleChangeServer(): void {
        if (!parsed) return;

        const to_v5 = server_ui.v5_text_mode ? server_ui.v5_value : parsed.current_server + server_ui.v5_value;
        const to_v3 = server_ui.v3_text_mode ? server_ui.v3_value : parsed.current_server + server_ui.v3_value;

        let new_url: string;
        if (parsed.page_type === 'ec3') {
            new_url = buildEc3Url(parsed.url, to_v3, to_v5);
        } else {
            new_url = buildEc5Url(parsed.url, to_v5, to_v3);
        }

        updateTabUrl(tab.tab_id, new_url);
    }
</script>

<Section.Root>
    <Section.Header>
        <Section.Title>서버 관리</Section.Title>
    </Section.Header>
    <Section.Content>
        <div class="server-panel">
            <div class="server-row">
                <span class="server-label">V5</span>
                <ToggleInput.Root
                    bind:value={server_ui.v5_value}
                    bind:isTextMode={server_ui.v5_text_mode}
                    onToggle={handleToggleV5}
                >
                    {#if !server_ui.v5_text_mode && parsed?.current_server}
                        <ToggleInput.Prefix>{parsed.current_server}</ToggleInput.Prefix>
                    {/if}
                    {#if server_ui.v5_text_mode}
                        <TextInput bind:value={server_ui.v5_value} />
                    {:else}
                        <Select bind:value={server_ui.v5_value} options={V5_SERVERS} />
                    {/if}
                    <ToggleInput.Toggle />
                </ToggleInput.Root>
            </div>
            <div class="server-row">
                <span class="server-label">V3</span>
                <ToggleInput.Root
                    bind:value={server_ui.v3_value}
                    bind:isTextMode={server_ui.v3_text_mode}
                    onToggle={handleToggleV3}
                >
                    {#if !server_ui.v3_text_mode && parsed?.current_server}
                        <ToggleInput.Prefix>{parsed.current_server}</ToggleInput.Prefix>
                    {/if}
                    {#if server_ui.v3_text_mode}
                        <TextInput bind:value={server_ui.v3_value} />
                    {:else}
                        <Select bind:value={server_ui.v3_value} options={V3_SERVERS} />
                    {/if}
                    <ToggleInput.Toggle />
                </ToggleInput.Root>
            </div>
        </div>
        <Button fullWidth onclick={handleChangeServer}>서버 적용</Button>
    </Section.Content>
</Section.Root>

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
