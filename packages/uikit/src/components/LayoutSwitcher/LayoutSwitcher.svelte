<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { LayoutMode } from '../../design/types';

    interface Props {
        children: Snippet<[{ layout_mode: LayoutMode }]>;
        class?: string | undefined;
        breakpoint?: number | undefined;
    }

    let { children, class: extra_class, breakpoint = 600 }: Props = $props();

    let container_el: HTMLDivElement | undefined = $state();
    let layout_mode = $state<LayoutMode>('compact');

    $effect(() => {
        const el = container_el;
        if (!el || typeof ResizeObserver === 'undefined') return;

        const ro = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width ?? 0;
            layout_mode = width >= breakpoint ? 'full' : 'compact';
        });
        ro.observe(el);
        return () => ro.disconnect();
    });
</script>

<div class={extra_class} bind:this={container_el}>
    {@render children({ layout_mode })}
</div>
