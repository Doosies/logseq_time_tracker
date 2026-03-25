<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet<[{ layout_mode: 'compact' | 'full' }]>;
    }

    let { children }: Props = $props();

    let container_el: HTMLDivElement | undefined = $state();
    let layout_mode = $state<'compact' | 'full'>('compact');

    $effect(() => {
        const el = container_el;
        if (!el || typeof ResizeObserver === 'undefined') return;

        const ro = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width ?? 0;
            layout_mode = width >= 600 ? 'full' : 'compact';
        });
        ro.observe(el);
        return () => ro.disconnect();
    });
</script>

<div class="layout-switcher-root" bind:this={container_el}>
    {@render children({ layout_mode })}
</div>

<style>
    .layout-switcher-root {
        width: 100%;
        min-width: 0;
        box-sizing: border-box;
    }
</style>
