<!--
@component Popover.Trigger - Button that toggles the popover

Renders a `<button>` with `aria-expanded` reflecting open state.
-->
<script lang="ts">
    import { Trigger as PrimitiveTrigger } from '../../primitives/Popover';
    import { popover_trigger } from '../../design/styles/popover.css';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLButtonAttributes, 'class'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const class_name = $derived([popover_trigger, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveTrigger class={class_name} {...rest}>
    {@render children()}
</PrimitiveTrigger>
