<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import { focusTrap } from '../../actions';

    interface PopoverContext {
        get is_open(): boolean;
        close: () => void;
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
    <div class={extra_class} {role} aria-label={label} aria-modal="true" use:focusTrap={{ onclose: ctx.close }}>
        {@render children()}
    </div>
{/if}
