<script lang="ts">
    import * as CheckboxList from '../';

    interface ListItem {
        id: string;
        label: string;
        visible: boolean;
    }

    let items = $state<ListItem[]>([
        { id: 'a', label: 'Item A', visible: true },
        { id: 'b', label: 'Item B', visible: false },
        { id: 'c', label: 'Item C', visible: false },
    ]);

    const visible_count = $derived(items.filter((i) => i.visible).length);

    function handleReorder(new_items: ListItem[]): void {
        items = new_items;
    }

    function handleToggle(id: string): void {
        items = items.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item));
    }
</script>

<CheckboxList.Root {items} onreorder={handleReorder}>
    {#snippet item({ item, handleAttach })}
        {@const is_last_visible = item.visible && visible_count <= 1}
        <CheckboxList.Item
            {handleAttach}
            checked={item.visible}
            disabled={is_last_visible}
            ontoggle={() => handleToggle(item.id)}
        >
            {item.label}
        </CheckboxList.Item>
    {/snippet}
</CheckboxList.Root>
