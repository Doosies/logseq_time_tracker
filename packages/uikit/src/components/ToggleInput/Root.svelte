<script lang="ts">
    import { setContext } from 'svelte';
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

    function toggle(): void {
        isTextMode = !isTextMode;
        onToggle?.();
    }

    setContext('toggle-input', {
        toggle,
    });

    const class_name = $derived([toggle_input_container, extra_class].filter(Boolean).join(' '));
</script>

<div class={class_name}>
    {@render children()}
</div>
