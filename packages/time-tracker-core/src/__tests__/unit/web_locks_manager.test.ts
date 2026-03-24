// @vitest-environment node

import { afterEach, describe, expect, it } from 'vitest';
import { WebLocksManager } from '../../adapters/storage/web_locks';

describe('WebLocksManager', () => {
    const navigator_snapshot = globalThis.navigator;

    afterEach(() => {
        Object.defineProperty(globalThis, 'navigator', {
            value: navigator_snapshot,
            configurable: true,
            writable: true,
        });
    });

    it('navigator.locks 없으면 미지원이고 acquireLock은 true 후 release', async () => {
        Object.defineProperty(globalThis, 'navigator', {
            value: { ...navigator_snapshot, locks: undefined },
            configurable: true,
            writable: true,
        });
        expect(WebLocksManager.isSupported()).toBe(false);
        const locks = new WebLocksManager();
        await expect(locks.acquireLock()).resolves.toBe(true);
        expect(locks.isLockHeld()).toBe(true);
        locks.releaseLock();
        expect(locks.isLockHeld()).toBe(false);
    });
});
