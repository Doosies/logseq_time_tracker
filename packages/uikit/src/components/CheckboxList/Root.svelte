<!--
@component CheckboxList.Root - Drag-and-drop checkbox list container

Wraps Dnd.Provider to provide a sortable list of checkbox items.

@prop items - Array of items with `{ id: string | number }` shape
@prop onreorder - Callback when items are reordered
@prop item - Snippet for each item, receives { item, index, handleAttach }

@example
```svelte
<CheckboxList.Root {items} onreorder={handleReorder}>
    {#snippet item({ item, index, handleAttach })}
        <CheckboxList.Item
            handleAttach={handleAttach}
            checked={item.visible}
            ontoggle={() => toggle(item.id)}
        >
            {item.label}
        </CheckboxList.Item>
    {/snippet}
</CheckboxList.Root>
```
-->
<script lang="ts" generics="T extends { id: string | number }">
    import { setContext } from 'svelte';
    import { Provider, Sortable } from '../Dnd';
    import { checkbox_list_container } from '../../design/styles/checkbox_list.css';
    import type { Snippet } from 'svelte';

    type HandleAttach = (node: HTMLElement) => () => void;
    interface Props {
        items: T[];
        onreorder?: (new_items: T[]) => void;
        item: Snippet<[{ item: T; index: number; handleAttach: HandleAttach }]>;
        class?: string;
    }

    let { items, onreorder, item, class: extra_class }: Props = $props();

    const class_name = $derived([checkbox_list_container, extra_class].filter(Boolean).join(' '));

    setContext('checkbox-list', {});
</script>

<Provider {items} {...onreorder != null && { onreorder }} class={class_name}>
    {#each items as _item, index (_item.id)}
        <Sortable id={_item.id} {index}>
            {#snippet children({ handleAttach }: { handleAttach: HandleAttach })}
                {@render item({ item: _item, index, handleAttach })}
            {/snippet}
        </Sortable>
    {/each}
</Provider>
