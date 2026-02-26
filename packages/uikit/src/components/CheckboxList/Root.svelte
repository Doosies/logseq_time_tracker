<!--
@component CheckboxList.Root - Drag-and-drop checkbox list container

Wraps `Dnd.Zone` to provide a sortable list of checkbox items.

@prop items - Array of items with `{ id: string | number }` shape
@prop type - DnD zone type identifier (default: 'checkbox-list')
@prop onconsider - DnD consider event callback
@prop onfinalize - DnD finalize event callback

@example
```svelte
<CheckboxList.Root {items} onconsider={handleConsider} onfinalize={handleFinalize}>
    {#each items as item (item.id)}
        <CheckboxList.Item checked={item.visible} ontoggle={() => toggle(item.id)}>
            {item.label}
        </CheckboxList.Item>
    {/each}
</CheckboxList.Root>
```
-->
<script lang="ts" generics="T extends { id: string | number }">
    import { Root as PrimitiveRoot } from '../../primitives/CheckboxList';
    import { checkbox_list_container } from '../../design/styles/checkbox_list.css';
    import type { DndEvent } from 'svelte-dnd-action';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        type?: string;
        onconsider?: (e: CustomEvent<DndEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DndEvent<T>>) => void;
        children: Snippet;
        class?: string;
    }

    let {
        items,
        type,
        onconsider,
        onfinalize,
        children,
        class: extra_class,
    }: Props = $props();

    const class_name = $derived([checkbox_list_container, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveRoot
    {items}
    class={class_name}
    {...(type != null ? { type } : {})}
    {...(onconsider != null ? { onconsider } : {})}
    {...(onfinalize != null ? { onfinalize } : {})}
>
    {@render children()}
</PrimitiveRoot>
