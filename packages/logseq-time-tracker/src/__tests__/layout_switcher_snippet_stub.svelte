<script lang="ts">
    import type { Snippet } from 'svelte';

    let {
        children,
    }: {
        children: Snippet<[{ layout_mode: 'compact' | 'full' }]>;
        class?: string;
        breakpoint?: number;
    } = $props();
</script>

<div class="layout-switcher-stub">
    {@render children({ layout_mode: 'compact' })}
</div>
