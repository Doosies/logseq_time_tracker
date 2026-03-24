import { SvelteMap } from 'svelte/reactivity';
import { TOAST_MAX_COUNT } from '../constants/config';
import { generateId } from '../utils';

export type ToastLevel = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    level: ToastLevel;
    message: string;
}

const AUTO_DISMISS_MS: Record<ToastLevel, number | null> = {
    success: 3000,
    info: 5000,
    warning: 5000,
    error: null,
};

export function createToastStore() {
    let toasts = $state<Toast[]>([]);
    const _timers = new SvelteMap<string, ReturnType<typeof setTimeout>>();

    function addToast(level: ToastLevel, message: string): void {
        if (toasts.some((t) => t.message === message)) return;
        if (toasts.length >= TOAST_MAX_COUNT) {
            const removed = toasts[0];
            toasts = toasts.slice(1);
            if (removed) {
                const timer = _timers.get(removed.id);
                if (timer) {
                    clearTimeout(timer);
                    _timers.delete(removed.id);
                }
            }
        }
        const id = generateId();
        toasts = [...toasts, { id, level, message }];

        const dismiss_ms = AUTO_DISMISS_MS[level];
        if (dismiss_ms !== null) {
            _timers.set(
                id,
                setTimeout(() => dismissToast(id), dismiss_ms),
            );
        }
    }

    function dismissToast(id: string): void {
        toasts = toasts.filter((t) => t.id !== id);
        const timer = _timers.get(id);
        if (timer) {
            clearTimeout(timer);
            _timers.delete(id);
        }
    }

    return {
        get toasts() {
            return toasts;
        },
        addToast,
        dismissToast,
    };
}

export type ToastStore = ReturnType<typeof createToastStore>;
