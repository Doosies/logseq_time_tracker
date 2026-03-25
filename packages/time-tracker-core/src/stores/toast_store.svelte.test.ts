import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TOAST_MAX_COUNT } from '../constants/config';
import { createToastStore } from './toast_store.svelte';

describe('createToastStore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('addToast: 토스트 추가', () => {
        const store = createToastStore();
        store.addToast('info', '안내');
        expect(store.toasts).toHaveLength(1);
        expect(store.toasts[0]?.message).toBe('안내');
        expect(store.toasts[0]?.level).toBe('info');
    });

    it('UC-TOAST-002: 중복 메시지: 동일 message 무시', () => {
        const store = createToastStore();
        store.addToast('success', '동일');
        store.addToast('error', '동일');
        expect(store.toasts).toHaveLength(1);
        expect(store.toasts[0]?.level).toBe('success');
    });

    it('UC-TOAST-001: FIFO: TOAST_MAX_COUNT(3) 초과 시 가장 오래된 토스트 제거', () => {
        expect(TOAST_MAX_COUNT).toBe(3);
        const store = createToastStore();
        store.addToast('info', 'a');
        store.addToast('info', 'b');
        store.addToast('info', 'c');
        expect(store.toasts.map((t) => t.message)).toEqual(['a', 'b', 'c']);
        store.addToast('info', 'd');
        expect(store.toasts.map((t) => t.message)).toEqual(['b', 'c', 'd']);
    });

    it('dismissToast: 특정 토스트 제거', () => {
        const store = createToastStore();
        store.addToast('warning', '유지');
        store.addToast('warning', '삭제');
        const remove_id = store.toasts.find((t) => t.message === '삭제')!.id;
        store.dismissToast(remove_id);
        expect(store.toasts.map((t) => t.message)).toEqual(['유지']);
    });

    it('auto_dismiss: success 3초 후 자동 제거 (vi.advanceTimersByTime)', () => {
        const store = createToastStore();
        store.addToast('success', '잠깐');
        expect(store.toasts).toHaveLength(1);
        vi.advanceTimersByTime(2999);
        expect(store.toasts).toHaveLength(1);
        vi.advanceTimersByTime(2);
        expect(store.toasts).toHaveLength(0);
    });

    it('UC-TOAST-003: auto_dismiss: error는 자동 제거 안 됨', () => {
        const store = createToastStore();
        store.addToast('error', '남음');
        vi.advanceTimersByTime(60_000);
        expect(store.toasts).toHaveLength(1);
    });
});
