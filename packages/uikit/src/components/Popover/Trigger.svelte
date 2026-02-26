<script lang="ts">
    import { Trigger as PrimitiveTrigger } from '../../primitives/Popover';
    import { popover_trigger } from '../../design/styles/popover.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([popover_trigger, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveTrigger class={class_name}>
    {@render children()}
</PrimitiveTrigger>
