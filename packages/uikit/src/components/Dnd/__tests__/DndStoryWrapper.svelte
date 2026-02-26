<script lang="ts">
    import * as Dnd from '../';
    import type { DndEvent } from 'svelte-dnd-action';

    interface DndItem {
        id: string;
        label: string;
    }

    let items = $state<DndItem[]>([
        { id: '1', label: 'Row 1' },
        { id: '2', label: 'Row 2' },
        { id: '3', label: 'Row 3' },
    ]);

    function handleConsider(e: CustomEvent<DndEvent<DndItem>>): void {
        items = e.detail.items;
    }

    function handleFinalize(e: CustomEvent<DndEvent<DndItem>>): void {
        items = e.detail.items;
    }
</script>

<Dnd.Zone {items} onconsider={handleConsider} onfinalize={handleFinalize}>
    {#each items as item (item.id)}
        <Dnd.Row>
            <Dnd.Handle variant="icon" />
            <span>{item.label}</span>
        </Dnd.Row>
    {/each}
</Dnd.Zone>
