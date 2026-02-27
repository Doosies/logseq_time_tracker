<script lang="ts" generics="T extends { id: string | number }">
    import { DragDropProvider } from '@dnd-kit/svelte';
    import { move } from '@dnd-kit/helpers';
    import type { Snippet } from 'svelte';

    type ItemsWithId = { id: string | number }[];

    interface Props {
        items: T[];
        onreorder?: (new_items: T[]) => void;
        children: Snippet;
        class?: string;
    }

    let { items, onreorder, children, class: extra_class }: Props = $props();

    function handleDragEnd(event: Parameters<typeof move>[1]): void {
        if (!onreorder) return;
        const items_with_id: ItemsWithId = items as ItemsWithId;
        const new_items = move(items_with_id, event);
        onreorder(new_items as T[]);
    }
</script>

<div role="group" class={extra_class}>
    <DragDropProvider onDragEnd={handleDragEnd}>
        {@render children()}
    </DragDropProvider>
</div>
