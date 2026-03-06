<script lang="ts">
    import { getContext } from 'svelte';

    interface ToastItem {
        id: number;
        message: string;
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
</script>

<div aria-live="polite" aria-relevant="additions">
    {#each ctx.toasts as toast (toast.id)}
        <div class={extra_class} role="status">
            {toast.message}
        </div>
    {/each}
</div>
