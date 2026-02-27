<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        checked?: boolean;
        disabled?: boolean;
        ontoggle?: () => void;
        handleAttach?: unknown;
        children: Snippet;
        class?: string;
    }

    let {
        checked = false,
        disabled = false,
        ontoggle,
        handleAttach,
        children,
        class: extra_class,
        ...rest
    }: Props = $props();
</script>

<div class={extra_class} {...rest}>
    {#if handleAttach}
        <span data-drag-handle aria-label="드래그하여 순서 변경" {@attach handleAttach}> ⠿ </span>
    {/if}
    <label style="display:flex;align-items:center;gap:0.5em;flex:1;min-width:0;cursor:pointer;">
        <input type="checkbox" {checked} {disabled} onchange={ontoggle} />
        {@render children()}
    </label>
</div>
