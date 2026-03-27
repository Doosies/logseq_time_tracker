<!--
@component Toast.Root - Toast message renderer

Renders all active toast messages as `role="status"` elements inside an `aria-live` region.
Place inside a `Toast.Provider`.
-->
<script lang="ts">
    import { getContext } from 'svelte';
    import type { ToastLevel } from '../../design/types';
    import { toast_container, toast_item } from '../../design/styles/toast.css';

    interface ToastItem {
        id: number;
        message: string;
        level: ToastLevel;
    }

    interface ToastContext {
        get toasts(): ToastItem[];
        hide: (id?: number) => void;
    }

    interface Props {
        class?: string;
    }

    let { class: extra_class }: Props = $props();
    const ctx = getContext<ToastContext>('toast');
    const container_class = $derived([toast_container, extra_class].filter(Boolean).join(' '));
</script>

<div class={container_class} aria-live="polite" aria-relevant="additions">
    {#each ctx.toasts as toast (toast.id)}
        <div class={toast_item} role="status" data-level={toast.level}>
            {toast.message}
        </div>
    {/each}
</div>
