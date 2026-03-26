<!--
@component Dnd.Sortable - Provider 하위의 단일 정렬 가능 행. 드래그 핸들은 children 스니펫의 handleAttach로 연결.
  Props: id, index, children (Snippet with handleAttach), class.
-->
<script lang="ts">
    import { Sortable as PrimitiveSortable } from '../../primitives/Dnd';
    import type { Snippet } from 'svelte';

    type HandleAttach = (node: HTMLElement) => () => void;

    interface Props {
        id: string | number;
        index: number;
        children: Snippet<[{ handleAttach: HandleAttach }]>;
        class?: string;
    }

    let { id, index, children, class: extra_class }: Props = $props();

    const class_name = $derived(`dnd-sortable ${extra_class ?? ''}`);
</script>

<PrimitiveSortable {id} {index} class={class_name} {children} />

<style>
    :global(.dnd-sortable) {
        outline: none;
        user-select: none;
    }
</style>
