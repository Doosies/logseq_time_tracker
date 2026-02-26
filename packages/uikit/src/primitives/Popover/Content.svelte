<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';

    interface PopoverContext {
        get is_open(): boolean;
    }

    interface Props {
        children: Snippet;
        class?: string;
        role?: string;
        label?: string;
    }

    let { children, class: extra_class, role = 'dialog', label }: Props = $props();
    const ctx = getContext<PopoverContext>('popover');
</script>

{#if ctx.is_open}
    <div class={extra_class} {role} aria-label={label}>
        {@render children()}
    </div>
{/if}
