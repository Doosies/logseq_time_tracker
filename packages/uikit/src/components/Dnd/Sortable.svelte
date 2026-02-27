<script lang="ts">
    import { Sortable as PrimitiveSortable } from '../../primitives/Dnd';
    import type { Snippet } from 'svelte';

    interface Props {
        id: string | number;
        index: number;
        children: Snippet<[{ handleAttach: unknown }]>;
        class?: string;
    }

    let { id, index, children, class: extra_class }: Props = $props();

    const class_name = $derived(`dnd-sortable ${extra_class ?? ''}`);
</script>

<PrimitiveSortable {id} {index} class={class_name} {children} />

<style>
    :global(.dnd-sortable) {
        outline: none;
        user-select: none;
    }
</style>
