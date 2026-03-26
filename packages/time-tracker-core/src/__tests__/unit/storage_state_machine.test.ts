// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { StorageStateMachine } from '../../adapters/storage/storage_state';

describe('StorageStateMachine', () => {
    it('UC-STORE-029: 초기 상태는 sqlite', () => {
        const sm = new StorageStateMachine();
        expect(sm.getState()).toEqual({ mode: 'sqlite' });
    });

    it('UC-STORE-030: transitionToFallback → memory_fallback 및 구독자 호출', () => {
        const sm = new StorageStateMachine();
        const listener = vi.fn();
        sm.subscribe(listener);
        sm.transitionToFallback('disk full');
        const state = sm.getState();
        expect(state.mode).toBe('memory_fallback');
        expect(state.fallback_reason).toBe('disk full');
        expect(state.fallback_since).toBeDefined();
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('UC-STORE-031: subscribe 해제 후 알림 없음', () => {
        const sm = new StorageStateMachine();
        const listener = vi.fn();
        const unsub = sm.subscribe(listener);
        unsub();
        sm.transitionToFallback('x');
        expect(listener).not.toHaveBeenCalled();
    });

    it('UC-STORE-032: transitionToSqlite로 복귀', () => {
        const sm = new StorageStateMachine();
        sm.transitionToFallback('err');
        sm.transitionToSqlite();
        expect(sm.getState()).toEqual({ mode: 'sqlite' });
    });
});
