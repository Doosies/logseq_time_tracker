<script lang="ts">
    import LayoutSwitcher from '../../components/LayoutSwitcher/LayoutSwitcher.svelte';
</script>

<div style:width="400px" style:min-height="32px">
    <LayoutSwitcher>
        {#snippet children({ layout_mode })}
            <span data-testid="a11y-layout-mode">{layout_mode}</span>
        {/snippet}
    </LayoutSwitcher>
</div>
