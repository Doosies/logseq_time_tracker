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
    {/if}
</PrimitiveToggle>
