<script lang="ts">
    import { setContext } from 'svelte';
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
</script>

<div class={extra_class}>
    {@render children()}
</div>
