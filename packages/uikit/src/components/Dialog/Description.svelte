<!--
@component Dialog.Description - Dialog description text

Secondary text below the title.
-->
<script lang="ts">
    import { Description as PrimitiveDescription } from '../../primitives/Dialog';
    import { dialog_description } from '../../design/styles/dialog.css';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLAttributes<HTMLParagraphElement>, 'id'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const class_name = $derived([dialog_description, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveDescription class={class_name} {...rest}>
    {@render children()}
</PrimitiveDescription>
