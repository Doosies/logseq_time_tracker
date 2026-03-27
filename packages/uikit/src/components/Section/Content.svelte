<script lang="ts">
    import { section_content } from '../../design/styles/section.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([section_content, extra_class].filter(Boolean).join(' '));
</script>

<div class={class_name}>
    {@render children()}
</div>
