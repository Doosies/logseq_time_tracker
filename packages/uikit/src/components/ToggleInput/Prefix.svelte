<script lang="ts">
    import { prefix_container } from '../../design/styles/toggle_input.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([prefix_container, extra_class].filter(Boolean).join(' '));
</script>

<div class={class_name}>
    {@render children()}
</div>
