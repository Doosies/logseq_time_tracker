<script lang="ts">
    import * as Dnd from '../../components/Dnd';

    interface DndItem {
        id: string;
        label: string;
    }

    let items = $state<DndItem[]>([
        { id: 'a', label: '항목 A' },
        { id: 'b', label: '항목 B' },
    ]);

    function handleReorder(new_items: DndItem[]): void {
        items = new_items;
    }
</script>

<Dnd.Provider {items} onreorder={handleReorder}>
    {#each items as item, index (item.id)}
        <Dnd.Sortable id={item.id} {index}>
            {#snippet children({ handleAttach })}
                <div style="display:flex;align-items:center;gap:0.5em;">
                    <span data-drag-handle aria-label="드래그하여 순서 변경" {@attach handleAttach}>⠿</span>
                    <span>{item.label}</span>
                </div>
            {/snippet}
        </Dnd.Sortable>
    {/each}
</Dnd.Provider>
