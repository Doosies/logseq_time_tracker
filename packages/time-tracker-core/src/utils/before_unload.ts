import type { ITimerService } from '../services/timer_service';

/**
 * Registers `beforeunload` to flush timer persistence. No-op when `window` is undefined (SSR/tests).
 * @returns Unsubscribe function.
 */
export function registerTimerBeforeUnload(timer_service: ITimerService): () => void {
    if (typeof window === 'undefined') {
        return () => {};
    }
    const handler = () => {
        void timer_service.flushBeforeUnload();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
}
