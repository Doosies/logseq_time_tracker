<script lang="ts">
    import * as Dnd from '../';

    interface Row {
        id: string;
        label: string;
    }

    let { items }: { items: Row[] } = $props();
</script>

<Dnd.Provider {items}>
    {#each items as item, index (item.id)}
        <Dnd.Sortable id={item.id} {index}>
            {#snippet children({ handleAttach })}
                <div data-testid="sortable-row">
                    <span data-drag-handle aria-label="드래그하여 순서 변경" {@attach handleAttach}>⠿</span>
                    <span>{item.label}</span>
                </div>
            {/snippet}
        </Dnd.Sortable>
    {/each}
</Dnd.Provider>
