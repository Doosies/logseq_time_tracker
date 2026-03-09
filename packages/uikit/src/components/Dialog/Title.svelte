<!--
@component Dialog.Title - Dialog heading

Styled heading for dialog title.
-->
<script lang="ts">
    import { Title as PrimitiveTitle } from '../../primitives/Dialog';
    import { dialog_title } from '../../design/styles/dialog.css';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLAttributes<HTMLHeadingElement>, 'id'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const class_name = $derived([dialog_title, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveTitle class={class_name} {...rest}>
    {@render children()}
</PrimitiveTitle>
