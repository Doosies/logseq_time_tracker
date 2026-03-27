<script lang="ts">
    import { Root, Item } from '../../components/CheckboxList';

    interface ListItem {
        id: string;
        label: string;
    }

    const items = $state<ListItem[]>([
        { id: '1', label: '항목 1' },
        { id: '2', label: '항목 2' },
    ]);
</script>

<Root {items}>
    {#snippet item({ item: current_item }: { item: ListItem; index: number; handleAttach: unknown })}
        <Item>{current_item.label}</Item>
    {/snippet}
</Root>
