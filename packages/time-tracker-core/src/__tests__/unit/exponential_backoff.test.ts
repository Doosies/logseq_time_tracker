// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { runWithExponentialBackoff } from '../../adapters/storage/exponential_backoff';

describe('runWithExponentialBackoff', () => {
    it('첫 시도 성공 시 sleep 없음', async () => {
        const sleep = vi.fn();
        const op = vi.fn().mockResolvedValue(42);
        const r = await runWithExponentialBackoff({ max_attempts: 3, base_delay_ms: 10, sleep }, op);
        expect(r).toBe(42);
        expect(op).toHaveBeenCalledTimes(1);
        expect(sleep).not.toHaveBeenCalled();
    });

    it('2번 실패 후 성공', async () => {
        const sleep = vi.fn().mockResolvedValue(undefined);
        const op = vi
            .fn()
            .mockRejectedValueOnce(new Error('a'))
            .mockRejectedValueOnce(new Error('b'))
            .mockResolvedValue(1);
        const r = await runWithExponentialBackoff({ max_attempts: 3, base_delay_ms: 5, sleep }, op);
        expect(r).toBe(1);
        expect(op).toHaveBeenCalledTimes(3);
        expect(sleep).toHaveBeenCalledTimes(2);
        expect(sleep.mock.calls[0]?.[0]).toBe(5);
        expect(sleep.mock.calls[1]?.[0]).toBe(10);
    });

    it('max_attempts 소진 시 마지막 에러 전파', async () => {
        const sleep = vi.fn().mockResolvedValue(undefined);
        const err = new Error('final');
        const op = vi.fn().mockRejectedValue(err);
        await expect(runWithExponentialBackoff({ max_attempts: 2, base_delay_ms: 1, sleep }, op)).rejects.toThrow(
            'final',
        );
        expect(op).toHaveBeenCalledTimes(2);
    });
});
