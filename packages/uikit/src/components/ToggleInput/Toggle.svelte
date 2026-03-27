<script lang="ts">
    import { getContext } from 'svelte';
    import { toggle_icon } from '../../design/styles/toggle_input.css';
    import type { Snippet } from 'svelte';

    interface ToggleInputContext {
        toggle: () => void;
    }

    interface Props {
        label?: string;
        children?: Snippet;
        class?: string;
    }

    let { label = 'Toggle input mode', children, class: extra_class }: Props = $props();
    const ctx = getContext<ToggleInputContext>('toggle-input');
    const class_name = $derived([toggle_icon, extra_class].filter(Boolean).join(' '));
</script>

<button type="button" class={class_name} onclick={ctx.toggle} aria-label={label}>
    {#if children}
        {@render children()}
    {:else}
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
        >
            <path d="M8 3L4 7l4 4" />
            <path d="M4 7h16" />
            <path d="M16 21l4-4-4-4" />
            <path d="M20 17H4" />
        </svg>
    {/if}
</button>
