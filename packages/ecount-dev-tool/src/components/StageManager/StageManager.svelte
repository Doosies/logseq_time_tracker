<script lang="ts">
    import type { ParsedUrl } from '#types/server';
    import { Section, Button } from '@personal/uikit';
    import { buildStageUrl, getStageButtonLabel } from '#services/url_service';
    import { updateTabUrl } from '#services/tab_service';
    import { getTabState } from '#stores/current_tab.svelte';

    const tab = $derived(getTabState());
    const parsed = $derived(tab.parsed as ParsedUrl);
    const button_label = $derived(parsed ? getStageButtonLabel(parsed.url) : '');

    function handleStageSwitch(): void {
        if (!parsed) return;
        const new_url = buildStageUrl(parsed.url);
        if (new_url) {
            updateTabUrl(tab.tab_id, new_url);
        }
    }
</script>

<Section title="Stage Server Manager">
    <Button fullWidth onclick={handleStageSwitch}>
        {button_label}
    </Button>
</Section>
