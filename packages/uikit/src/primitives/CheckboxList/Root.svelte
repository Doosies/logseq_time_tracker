<script lang="ts" generics="T extends { id: string | number }">
    import { Zone } from '../Dnd';
    import type { DndEvent } from 'svelte-dnd-action';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        type?: string;
        onconsider?: (e: CustomEvent<DndEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DndEvent<T>>) => void;
        children: Snippet;
        class?: string;
    }

    let {
        items,
        type = 'checkbox-list',
        onconsider,
        onfinalize,
        children,
        class: extra_class,
    }: Props = $props();

    setContext('checkbox-list', {});
</script>

<Zone
    {items}
    {type}
    class={extra_class}
    {...(onconsider != null ? { onconsider } : {})}
    {...(onfinalize != null ? { onfinalize } : {})}
>
    {@render children()}
</Zone>
