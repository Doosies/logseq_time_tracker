<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/ToggleInput';
    import { toggle_input_container } from '../../design/styles/toggle_input.css';
    import type { Snippet } from 'svelte';

    interface Props {
        value?: string | undefined;
        isTextMode?: boolean | undefined;
        onToggle?: (() => void) | undefined;
        children: Snippet;
        class?: string;
    }

    let {
        value = $bindable(),
        isTextMode = $bindable(false),
        onToggle,
        children,
        class: extra_class,
    }: Props = $props();

    const class_name = $derived([toggle_input_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveRoot class={class_name} bind:value bind:isTextMode {onToggle}>
    {@render children()}
</PrimitiveRoot>
