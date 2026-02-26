<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';

    interface PopoverContext {
        get is_open(): boolean;
        toggle: () => void;
    }

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const ctx = getContext<PopoverContext>('popover');
</script>

<button
    type="button"
    class={extra_class}
    onclick={ctx.toggle}
    aria-expanded={ctx.is_open}
>
    {@render children()}
</button>
