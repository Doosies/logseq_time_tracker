<script lang="ts">
    import LayoutSwitcher from '../LayoutSwitcher.svelte';

    interface Props {
        breakpoint?: number;
        width_px?: number;
        class?: string;
    }

    let { breakpoint = 600, width_px = 800, class: extra_class }: Props = $props();
</script>

<div
    style:width="{width_px}px"
    style:min-height="48px"
    style:box-sizing="border-box"
    style:border="1px solid #ccc"
    style:padding="8px"
>
    <LayoutSwitcher {breakpoint} class={extra_class}>
        {#snippet children({ layout_mode })}
            <p data-testid="layout-mode">레이아웃: {layout_mode}</p>
        {/snippet}
    </LayoutSwitcher>
</div>
