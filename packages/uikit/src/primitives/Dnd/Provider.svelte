<script lang="ts" generics="T extends { id: string | number }">
    import { DragDropProvider } from '@dnd-kit/svelte';
    import { PointerSensor, PointerActivationConstraints, KeyboardSensor } from '@dnd-kit/dom';
    import { move } from '@dnd-kit/helpers';
    import type { Snippet } from 'svelte';

    type ItemsWithId = { id: string | number }[];

    interface Props {
        items: T[];
        onreorder?: (new_items: T[]) => void;
        children: Snippet;
        class?: string;
        activation_distance?: number;
    }

    let { items, onreorder, children, class: extra_class, activation_distance }: Props = $props();

    const configured_sensors = $derived(
        activation_distance != null
            ? [
                  PointerSensor.configure({
                      activationConstraints: [
                          new PointerActivationConstraints.Distance({ value: activation_distance }),
                      ],
                  }),
                  KeyboardSensor,
              ]
            : undefined,
    );

    function handleDragEnd(event: Parameters<typeof move>[1]): void {
        if (!onreorder) return;
        const items_with_id: ItemsWithId = items as ItemsWithId;
        const new_items = move(items_with_id, event);
        onreorder(new_items as T[]);
    }
</script>

<div role="group" class={extra_class}>
    <DragDropProvider {...configured_sensors ? { sensors: configured_sensors } : {}} onDragEnd={handleDragEnd}>
        {@render children()}
    </DragDropProvider>
</div>
