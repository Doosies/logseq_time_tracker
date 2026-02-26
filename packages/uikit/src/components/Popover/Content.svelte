<!--
@component Popover.Content - Popover content panel

Only rendered when the popover is open. Positioned absolutely below the trigger.

@prop role - ARIA role (default: 'dialog')
@prop label - ARIA label for accessibility
-->
<script lang="ts">
    import { Content as PrimitiveContent } from '../../primitives/Popover';
    import { popover_content } from '../../design/styles/popover.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
        role?: string;
        label?: string;
    }

    let { children, class: extra_class, role, label }: Props = $props();
    const class_name = $derived([popover_content, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveContent
    class={class_name}
    {...(role != null ? { role } : {})}
    {...(label != null ? { label } : {})}
>
    {@render children()}
</PrimitiveContent>
