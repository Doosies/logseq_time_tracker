<script lang="ts">
    import { setContext } from 'svelte';
    import type { Snippet } from 'svelte';
    import type { ToastLevel } from '../../design/types';

    interface ToastItem {
        id: number;
        message: string;
        level: ToastLevel;
    }

    interface ToastContext {
        get toasts(): ToastItem[];
        show: (message: string, level?: ToastLevel) => void;
        hide: (id?: number) => void;
    }

    interface Props {
        duration?: number;
        children: Snippet;
    }

    let { duration = 2500, children }: Props = $props();
    let toasts = $state<ToastItem[]>([]);
    let next_id = $state(0);

    function show(message: string, level: ToastLevel = 'info'): void {
        const id = next_id++;
        toasts = [...toasts, { id, message, level }];
        setTimeout(() => {
            hide(id);
        }, duration);
    }

    function hide(id?: number): void {
        if (id != null) {
            toasts = toasts.filter((t) => t.id !== id);
        } else {
            toasts = [];
        }
    }

    const ctx: ToastContext = {
        get toasts() {
            return toasts;
        },
        show,
        hide,
    };

    setContext('toast', ctx);
</script>

{@render children()}
