<script lang="ts">
    import { Prefix as PrimitivePrefix } from '../../primitives/ToggleInput';
    import { prefix_container } from '../../design/styles/toggle_input.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([prefix_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitivePrefix class={class_name}>
    {@render children()}
</PrimitivePrefix>
