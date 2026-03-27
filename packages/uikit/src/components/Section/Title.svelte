<script lang="ts">
    import { section_title } from '../../design/styles/section.css';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    const class_name = $derived([section_title, extra_class].filter(Boolean).join(' '));
</script>

<div
    class={class_name}
    data-drag-handle
    data-section-header
    role="button"
    tabindex="0"
    aria-label="드래그하여 섹션 순서 변경"
>
    {@render children()}
</div>
