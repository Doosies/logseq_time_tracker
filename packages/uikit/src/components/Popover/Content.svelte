<!--
@component Popover.Content - Popover content panel

Only rendered when the popover is open. Positioned absolutely below the trigger.

@prop role - ARIA role (default: 'dialog')
@prop label - ARIA label for accessibility
-->
<script lang="ts">
    import { getContext } from 'svelte';
    import { focusTrap } from '../../actions';
    import { popover_content } from '../../design/styles/popover.css';
    import type { Snippet } from 'svelte';

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
    const class_name = $derived([popover_content, extra_class].filter(Boolean).join(' '));
</script>

{#if ctx.is_open}
    <div class={class_name} {role} aria-label={label} aria-modal="true" use:focusTrap={{ onclose: ctx.close }}>
        {@render children()}
    </div>
{/if}
