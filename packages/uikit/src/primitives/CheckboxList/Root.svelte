<script lang="ts" generics="T extends { id: string | number }">
    import { setContext } from 'svelte';
    import { Provider, Sortable } from '../Dnd';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        onreorder?: (new_items: T[]) => void;
        item: Snippet<[{ item: T; index: number; handleAttach: unknown }]>;
        class?: string;
    }

    let { items, onreorder, item, class: extra_class }: Props = $props();

    setContext('checkbox-list', {});
</script>

<Provider {items} {...onreorder != null && { onreorder }} {...extra_class != null && { class: extra_class }}>
    {#each items as _item, index (_item.id)}
        <Sortable id={_item.id} {index}>
            {#snippet children({ handleAttach })}
                {@render item({ item: _item, index, handleAttach })}
            {/snippet}
        </Sortable>
    {/each}
</Provider>
