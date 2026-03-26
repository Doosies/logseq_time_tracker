<!--
@component Dnd.Provider - 드래그 앤 드롭 정렬 컨텍스트. 자식에서 Sortable과 함께 사용.
  Props: items (정렬 대상 배열, id 필수), onreorder (선택, 새 순서 반영), children, class, activation_distance (선택, 포인터 활성 거리).
-->
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
