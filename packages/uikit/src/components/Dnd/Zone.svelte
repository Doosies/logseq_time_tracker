<!--
@component Dnd.Zone - 드래그앤드롭 가능한 영역 컨테이너

svelte-dnd-action을 래핑한 헤드리스 컴포넌트.
내부에 `{#each}` + `Dnd.Row`를 조합하여 사용합니다.

@example
```svelte
<Dnd.Zone items={my_items} onconsider={handleConsider} onfinalize={handleFinalize}>
    {#each my_items as item (item.id)}
        <Dnd.Row>
            <Dnd.Handle />
            <span>{item.label}</span>
        </Dnd.Row>
    {/each}
</Dnd.Zone>
```
-->
<script lang="ts" generics="T extends { id: string | number }">
    import { dragHandleZone } from 'svelte-dnd-action';
    import type { DndEvent } from 'svelte-dnd-action';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        type?: string;
        flipDurationMs?: number;
        dragDisabled?: boolean;
        dropTargetStyle?: Record<string, string>;
        onconsider?: (e: CustomEvent<DndEvent<T>>) => void;
        onfinalize?: (e: CustomEvent<DndEvent<T>>) => void;
        children: Snippet;
        class?: string;
    }

    let {
        items,
        type = 'default',
        flipDurationMs = 80,
        dragDisabled = false,
        dropTargetStyle = { outline: 'none' },
        onconsider,
        onfinalize,
        children,
        class: extraClass,
    }: Props = $props();

    let container_el: HTMLElement;
    let select_snapshot: string[] = [];

    function captureSelectValues(e: PointerEvent): void {
        if (!container_el) return;
        const target = e.target as HTMLElement;
        const item_el = Array.from(container_el.children).find(
            (child) => child.contains(target),
        ) as HTMLElement | undefined;
        if (!item_el) return;
        select_snapshot = Array.from(item_el.querySelectorAll('select')).map((s) => s.value);
    }

    function syncSelectValues(ghost_el?: HTMLElement): void {
        if (!ghost_el || select_snapshot.length === 0) return;
        const ghost_selects = ghost_el.querySelectorAll('select');
        ghost_selects.forEach((sel, i) => {
            const val = select_snapshot[i];
            if (val !== undefined) {
                sel.value = val;
            }
        });
        select_snapshot = [];
    }

    function handleConsider(e: Event): void {
        onconsider?.(e as CustomEvent<DndEvent<T>>);
    }

    function handleFinalize(e: Event): void {
        onfinalize?.(e as CustomEvent<DndEvent<T>>);
    }
</script>

<div
    bind:this={container_el}
    role="group"
    class={extraClass}
    use:dragHandleZone={{ items, type, flipDurationMs, dragDisabled, dropTargetStyle, transformDraggedElement: syncSelectValues }}
    onpointerdown={captureSelectValues}
    onconsider={handleConsider}
    onfinalize={handleFinalize}
>
    {@render children()}
</div>

<style>
    :global(#dnd-action-dragged-el) {
        border: none !important;
        outline: none !important;
        transition: none !important;
        background-color: rgba(255, 255, 255, 0.85) !important;
    }
</style>
