import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ITimerService } from '../services/timer_service';
import { registerTimerBeforeUnload } from './before_unload';

describe('registerTimerBeforeUnload', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('UC-UTIL-009: window가 있으면 beforeunload 리스너를 등록한다', () => {
        const add_spy = vi.spyOn(window, 'addEventListener');
        const timer_service = { flushBeforeUnload: vi.fn() } as unknown as ITimerService;

        const unsubscribe = registerTimerBeforeUnload(timer_service);
        expect(add_spy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
        unsubscribe();
    });

    it('UC-UTIL-010: 반환 함수 호출 시 beforeunload 리스너를 해제한다', () => {
        const remove_spy = vi.spyOn(window, 'removeEventListener');
        const timer_service = { flushBeforeUnload: vi.fn() } as unknown as ITimerService;

        const unsubscribe = registerTimerBeforeUnload(timer_service);
        unsubscribe();

        expect(remove_spy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });

    it('UC-UTIL-011: beforeunload 발생 시 flushBeforeUnload를 호출한다', () => {
        const flush_mock = vi.fn();
        const timer_service = { flushBeforeUnload: flush_mock } as unknown as ITimerService;

        const unsubscribe = registerTimerBeforeUnload(timer_service);
        window.dispatchEvent(new Event('beforeunload'));
        expect(flush_mock).toHaveBeenCalledTimes(1);
        unsubscribe();
    });
});
