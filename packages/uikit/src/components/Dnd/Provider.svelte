<script lang="ts" generics="T extends { id: string | number }">
    import { Provider as PrimitiveProvider } from '../../primitives/Dnd';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        onreorder?: (new_items: T[]) => void;
        children: Snippet;
        class?: string;
        activation_distance?: number;
    }

    let { items, onreorder, children, class: extra_class, activation_distance }: Props = $props();
</script>

<PrimitiveProvider
    {items}
    {...onreorder != null ? { onreorder } : {}}
    {...extra_class != null ? { class: extra_class } : {}}
    {...activation_distance != null ? { activation_distance } : {}}
>
    {@render children()}
</PrimitiveProvider>
