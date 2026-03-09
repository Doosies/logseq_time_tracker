<script lang="ts">
    import { getContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    import type { DialogContext } from './Root.svelte';

    interface Props extends Omit<HTMLButtonAttributes, 'class'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extraClass, ...rest }: Props = $props();
    const ctx = getContext<DialogContext>('dialog');
</script>

<button
    type="button"
    class={extraClass}
    onclick={ctx.open}
    aria-haspopup="dialog"
    aria-expanded={ctx.is_open}
    {...rest}
>
    {@render children()}
</button>
