<!--
@component Dialog.Close - Close button

Positioned in the top-right corner of the dialog content.
-->
<script lang="ts">
    import { Close as PrimitiveClose } from '../../primitives/Dialog';
    import { dialog_close } from '../../design/styles/dialog.css';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLButtonAttributes, 'class'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class, ...rest }: Props = $props();
    const class_name = $derived([dialog_close, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveClose class={class_name} {...rest}>
    {@render children()}
</PrimitiveClose>
