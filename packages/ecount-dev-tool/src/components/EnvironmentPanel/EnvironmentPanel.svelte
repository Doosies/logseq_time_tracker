<script lang="ts">
    import { ServerManager } from '../ServerManager';
    import { StageManager } from '../StageManager';
    import type { ParsedUrl, ServerConfig } from '@/types';

    interface EnvironmentPanelProps {
        parsed_url: ParsedUrl;
        onServerChange?: (config: ServerConfig) => void;
        onStageChange?: (stage: string) => void;
    }

    let {
        parsed_url,
        onServerChange,
        onStageChange,
    }: EnvironmentPanelProps = $props();

    let v3_domain = $state(parsed_url.v3_domain);
    let v5_domain = $state(parsed_url.v5_domain);
    let current_stage = $state(parsed_url.current_server);

    $effect(() => {
        v3_domain = parsed_url.v3_domain;
        v5_domain = parsed_url.v5_domain;
        current_stage = parsed_url.current_server;
    });
</script>

{#if parsed_url.environment === 'stage'}
    <StageManager
        bind:current_stage
        onchange={onStageChange}
    />
{:else}
    <ServerManager
        current_server={parsed_url.current_server}
        bind:initial_v3={v3_domain}
        bind:initial_v5={v5_domain}
        onchange={onServerChange}
    />
{/if}
