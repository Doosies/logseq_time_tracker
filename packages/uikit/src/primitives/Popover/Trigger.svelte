<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';

    interface PopoverContext {
        get is_open(): boolean;
        toggle: () => void;
    }

    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLButtonAttributes, 'class'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const ctx = getContext<PopoverContext>('popover');
</script>

<button type="button" class={extra_class} onclick={ctx.toggle} aria-expanded={ctx.is_open} {...rest}>
    {@render children()}
</button>
