<script lang="ts">
    import { getContext } from 'svelte';
    import type { ToastLevel } from '../../design/types';

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
        item_class?: string;
    }

    let { class: extra_class, item_class }: Props = $props();
    const ctx = getContext<ToastContext>('toast');
</script>

<div class={extra_class} aria-live="polite" aria-relevant="additions">
    {#each ctx.toasts as toast (toast.id)}
        <div class={item_class} role="status" data-level={toast.level}>
            {toast.message}
        </div>
    {/each}
</div>
