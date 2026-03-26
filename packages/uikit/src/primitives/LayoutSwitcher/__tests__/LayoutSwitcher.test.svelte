<script lang="ts">
    import { LayoutSwitcher } from '../';

    let { breakpoint }: { breakpoint?: number } = $props();
</script>

<LayoutSwitcher {breakpoint}>
    {#snippet children({ layout_mode })}
        <div data-testid="content" data-mode={layout_mode}>
            {layout_mode}
        </div>
    {/snippet}
</LayoutSwitcher>
