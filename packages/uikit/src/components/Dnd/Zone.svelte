<script lang="ts" generics="T extends { id: string | number }">
    import { Zone as PrimitiveZone } from '../../primitives/Dnd';
    import type { DndEvent } from 'svelte-dnd-action';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        type?: string;
        flipDurationMs?: number;
        dragDisabled?: boolean;
        dropTargetStyle?: Record<string, string>;
        onconsider?: (e: CustomEvent<DndEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DndEvent<T>>) => void;
        children: Snippet;
        class?: string;
    }

    let {
        items,
        type = 'default',
        flipDurationMs = 80,
        dragDisabled = false,
        dropTargetStyle = { outline: 'none' },
        onconsider,
        onfinalize,
        children,
        class: extraClass,
    }: Props = $props();
</script>

<PrimitiveZone
    {items}
    {type}
    {flipDurationMs}
    {dragDisabled}
    {dropTargetStyle}
    {...extraClass != null ? { class: extraClass } : {}}
    {...onconsider != null ? { onconsider } : {}}
    {...onfinalize != null ? { onfinalize } : {}}
>
    {@render children()}
</PrimitiveZone>

<style>
    :global(#dnd-action-dragged-el) {
        border: none !important;
        outline: none !important;
        transition: none !important;
        background-color: rgba(255, 255, 255, 0.85) !important;
    }
</style>
