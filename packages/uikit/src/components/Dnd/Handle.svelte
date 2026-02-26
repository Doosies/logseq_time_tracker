<script lang="ts">
    import { Handle as PrimitiveHandle } from '../../primitives/Dnd';

    interface Props {
        variant?: 'bar' | 'icon';
        label?: string;
    }

    let { variant = 'bar', label = '드래그하여 순서 변경' }: Props = $props();
</script>

{#if variant === 'bar'}
    <div class="drag-handle-bar" data-drag-handle>
        <PrimitiveHandle {label}>
            <span class="grip-dots"></span>
        </PrimitiveHandle>
    </div>
{:else}
    <PrimitiveHandle {label} class="drag-handle-icon"></PrimitiveHandle>
{/if}

<style>
    .grip-dots,
    :global(.drag-handle-icon) {
        display: block;
        background-image: radial-gradient(circle, currentColor 1.2px, transparent 1.2px);
        background-repeat: repeat;
        flex-shrink: 0;
    }

    .drag-handle-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 3px 0;
        margin-bottom: var(--space-xs);
        color: var(--color-text-secondary);
        background: none;
        border: none;
        border-radius: var(--radius-sm);
        opacity: 0.3;
        transition:
            opacity 0.15s ease,
            background-color 0.15s ease,
            color 0.15s ease;
        user-select: none;
    }

    .drag-handle-bar::before,
    .drag-handle-bar::after {
        content: '';
        flex: 1;
        height: 1px;
        background: currentColor;
        opacity: 0.4;
    }

    .drag-handle-bar::before {
        margin-right: var(--space-sm);
    }

    .drag-handle-bar::after {
        margin-left: var(--space-sm);
    }

    .drag-handle-bar:active {
        opacity: 1;
    }

    .grip-dots {
        width: 14px;
        height: 8px;
        background-size: 4px 4px;
        background-position:
            0 0,
            4px 0,
            8px 0;
    }

    :global(.drag-handle-icon) {
        width: 10px;
        height: 14px;
        background-size: 4px 5px;
        color: var(--color-text-secondary);
        opacity: 0.4;
        transition: opacity 0.1s ease;
    }
</style>
