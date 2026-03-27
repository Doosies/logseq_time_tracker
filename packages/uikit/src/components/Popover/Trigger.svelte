<!--
@component Popover.Trigger - Button that toggles the popover

Renders a `<button>` with `aria-expanded` reflecting open state.
-->
<script lang="ts">
    import { getContext } from 'svelte';
    import { popover_trigger } from '../../design/styles/popover.css';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface PopoverContext {
        get is_open(): boolean;
        toggle: () => void;
    }

    interface Props extends Omit<HTMLButtonAttributes, 'class'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const ctx = getContext<PopoverContext>('popover');
    const class_name = $derived([popover_trigger, extra_class].filter(Boolean).join(' '));
</script>

<button
    type="button"
    class={class_name}
    onclick={ctx.toggle}
    aria-haspopup="true"
    aria-expanded={ctx.is_open}
    {...rest}
>
    {@render children()}
</button>
