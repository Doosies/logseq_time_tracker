<!--
@component Dialog.Trigger - Button that opens the dialog

Re-exports primitive Trigger.
-->
<script lang="ts">
    import { Trigger as PrimitiveTrigger } from '../../primitives/Dialog';
    import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLButtonAttributes, 'class'> {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class = '', ...rest }: Props = $props();
</script>

<PrimitiveTrigger class={extra_class} {...rest}>
    {@render children()}
</PrimitiveTrigger>
