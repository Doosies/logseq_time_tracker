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
    import { dndzone } from 'svelte-dnd-action';
    import type { DndEvent } from 'svelte-dnd-action';
    import { blockDragFromInteractive, type BlockDragOptions } from '../../actions';
    import type { Snippet } from 'svelte';

    interface Props {
        items: T[];
        type?: string;
        flipDurationMs?: number;
        dragDisabled?: boolean;
        dropTargetStyle?: Record<string, string>;
        dragHandleSelector?: string;
        interactiveSelector?: string;
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
        dragHandleSelector,
        interactiveSelector,
        onconsider,
        onfinalize,
        children,
        class: extraClass,
    }: Props = $props();

    const blockOptions = $derived<BlockDragOptions | undefined>(
        dragHandleSelector
            ? {
                  dragHandleSelector,
                  ...(interactiveSelector ? { interactiveSelector } : {}),
              }
            : undefined,
    );

    function handleConsider(e: Event): void {
        onconsider?.(e as CustomEvent<DndEvent<T>>);
    }

    function handleFinalize(e: Event): void {
        onfinalize?.(e as CustomEvent<DndEvent<T>>);
    }
</script>

<div
    class={extraClass}
    use:dndzone={{ items, type, flipDurationMs, dragDisabled, dropTargetStyle }}
    use:blockDragFromInteractive={blockOptions}
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
    }
</style>
