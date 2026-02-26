<script lang="ts">
    import * as CheckboxList from '../';
    import type { DndEvent } from 'svelte-dnd-action';

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

    function handleConsider(e: CustomEvent<DndEvent<ListItem>>): void {
        items = e.detail.items;
    }

    function handleFinalize(e: CustomEvent<DndEvent<ListItem>>): void {
        items = e.detail.items;
    }

    function handleToggle(id: string): void {
        items = items.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item));
    }
</script>

<CheckboxList.Root {items} onconsider={handleConsider} onfinalize={handleFinalize}>
    {#each items as item (item.id)}
        {@const is_last_visible = item.visible && visible_count <= 1}
        <CheckboxList.Item checked={item.visible} disabled={is_last_visible} ontoggle={() => handleToggle(item.id)}>
            {item.label}
        </CheckboxList.Item>
    {/each}
</CheckboxList.Root>
