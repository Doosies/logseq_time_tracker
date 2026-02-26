<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';

    interface ToggleInputContext {
        toggle: () => void;
    }

    interface Props {
        label?: string;
        children?: Snippet;
        class?: string;
    }

    let { label = 'Toggle input mode', children, class: extra_class }: Props = $props();
    const ctx = getContext<ToggleInputContext>('toggle-input');
</script>

<button type="button" class={extra_class} onclick={ctx.toggle} aria-label={label}>
    {#if children}
        {@render children()}
    {:else}
        ⇄
    {/if}
</button>
