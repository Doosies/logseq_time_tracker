<script lang="ts" generics="T extends { id: string | number }">
    import { dndzone } from 'svelte-dnd-action';
    import type { DndEvent } from 'svelte-dnd-action';
    import { blockDragFromInteractive, type BlockDragOptions } from '../../actions';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        type?: string;
        flipDurationMs?: number;
        dragDisabled?: boolean;
        dropTargetStyle?: Record<string, string>;
        dragHandleSelector?: string;
        interactiveSelector?: string;
        onconsider?: (e: CustomEvent<DndEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DndEvent<T>>) => void;
        row: Snippet<[T]>;
        class?: string;
    }

    let {
        items,
        type = 'default',
        flipDurationMs = 80,
        dragDisabled = false,
        dropTargetStyle = { outline: 'none' },
        dragHandleSelector,
        interactiveSelector,
        onconsider,
        onfinalize,
        row,
        class: extra_class,
    }: Props = $props();

    const block_options = $derived<BlockDragOptions | undefined>(
        dragHandleSelector
            ? {
                  dragHandleSelector,
                  ...(interactiveSelector ? { interactiveSelector } : {}),
              }
            : undefined,
    );

    function handleConsider(e: Event): void {
        onconsider?.(e as CustomEvent<DndEvent<T>>);
    }

    function handleFinalize(e: Event): void {
        onfinalize?.(e as CustomEvent<DndEvent<T>>);
    }
</script>

<div
    class={extra_class}
    use:dndzone={{ items, type, flipDurationMs, dragDisabled, dropTargetStyle }}
    use:blockDragFromInteractive={block_options}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
>
    {#each items as item (item.id)}
        {@render row(item)}
    {/each}
</div>

<style>
    :global(#dnd-action-dragged-el) {
        border: none !important;
        outline: none !important;
        border-radius: 10px !important;
        opacity: 0.96 !important;
        scale: 1.015 !important;
        box-shadow:
            0 0 0 1.5px rgba(37, 99, 235, 0.25),
            0 8px 16px -2px rgba(0, 0, 0, 0.14),
            0 24px 48px -8px rgba(0, 0, 0, 0.22) !important;
        transition: none !important;
    }
</style>
