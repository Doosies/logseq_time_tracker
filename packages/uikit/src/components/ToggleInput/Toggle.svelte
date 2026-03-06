<script lang="ts">
    import { Toggle as PrimitiveToggle } from '../../primitives/ToggleInput';
    import { toggle_icon } from '../../design/styles/toggle_input.css';
    import type { Snippet } from 'svelte';

    interface Props {
        label?: string;
        children?: Snippet;
        class?: string;
    }

    let { label, children, class: extra_class }: Props = $props();
    const class_name = $derived([toggle_icon, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveToggle class={class_name} {...label != null ? { label } : {}}>
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
</PrimitiveToggle>
