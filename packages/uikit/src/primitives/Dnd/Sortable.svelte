<script lang="ts">
    import { createSortable } from '@dnd-kit/svelte/sortable';
    import type { Snippet } from 'svelte';

    type HandleAttach = (node: HTMLElement) => () => void;

    interface Props {
        id: string | number;
        index: number;
        children: Snippet<[{ handleAttach: HandleAttach }]>;
        class?: string;
    }

    let { id, index, children, class: extra_class }: Props = $props();

    const sortable = createSortable({
        get id() {
            return id;
        },
        get index() {
            return index;
        },
    });
</script>

<div class={extra_class} {@attach sortable.attach}>
    {@render children({ handleAttach: sortable.attachHandle })}
</div>
