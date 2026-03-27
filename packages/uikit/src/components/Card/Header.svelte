<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<header class={extra_class ?? ''}>
    {@render children()}
</header>
