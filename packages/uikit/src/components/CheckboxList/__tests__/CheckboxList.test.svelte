<script lang="ts">
    import * as CheckboxList from '../';

    type Row = { id: string; label: string; visible: boolean };

    let items = $state<Row[]>([
        { id: 'a', label: '옵션 A', visible: false },
        { id: 'b', label: '옵션 B', visible: true },
    ]);

    function handleReorder(new_items: Row[]): void {
        items = new_items;
    }

    function handleToggle(id: string): void {
        items = items.map((row) => (row.id === id ? { ...row, visible: !row.visible } : row));
    }
</script>

<CheckboxList.Root {items} onreorder={handleReorder}>
    {#snippet item({ item, handleAttach })}
        <CheckboxList.Item {handleAttach} checked={item.visible} ontoggle={() => handleToggle(item.id)}>
            {item.label}
        </CheckboxList.Item>
    {/snippet}
</CheckboxList.Root>
