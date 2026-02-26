<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLButtonElement> {
        disabled?: boolean | undefined;
        class?: string | undefined;
        onclick?: (() => void) | undefined;
        children: Snippet;
    }

    let { disabled = false, class: extra_class, onclick, children, ...rest }: Props = $props();
</script>

<button class={extra_class} {disabled} onclick={() => onclick?.()} type="button" {...rest}>
    {@render children()}
</button>
