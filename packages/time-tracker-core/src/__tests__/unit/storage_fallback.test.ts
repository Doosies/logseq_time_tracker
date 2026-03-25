// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import type { IStorageBackend } from '../../adapters/storage/sqlite/storage_backend';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import { StorageManager } from '../../adapters/storage/storage_manager';

class ThrowingBackend implements IStorageBackend {
    async read(): Promise<Uint8Array | null> {
        throw new Error('read failed');
    }

    async write(_data: Uint8Array): Promise<void> {
        throw new Error('write failed');
    }

    async exists(): Promise<boolean> {
        return false;
    }
}

class MutableFailBackend implements IStorageBackend {
    should_fail = true;
    private data: Uint8Array | null = null;

    async read(): Promise<Uint8Array | null> {
        if (this.should_fail) {
            throw new Error('temporary');
        }
        return this.data;
    }

    async write(d: Uint8Array): Promise<void> {
        this.data = new Uint8Array(d);
    }

    async exists(): Promise<boolean> {
        return this.data !== null;
    }
}

const fast_retry = { max_attempts: 2, base_delay_ms: 0, sleep: async () => {} };

describe('StorageManager 메모리 폴백·복구', () => {
    it('UC-STORE-006: SQLite 초기화 실패 시 MemoryUnitOfWork와 memory_fallback 상태', async () => {
        const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        const sm = new StorageManager({
            sqlite_options: {},
            backend: new ThrowingBackend(),
            logger,
            retry_options: fast_retry,
        });
        const uow = await sm.initialize();
        expect(uow).toBeInstanceOf(MemoryUnitOfWork);
        expect(sm.getStorageState().mode).toBe('memory_fallback');
        expect(logger.warn).toHaveBeenCalled();
        sm.dispose();
    });

    it('tryRecover 성공 시 Memory에서 SQLite로 데이터가 이전된다', async () => {
        const backend = new MutableFailBackend();
        const sm = new StorageManager({
            sqlite_options: {},
            backend,
            retry_options: fast_retry,
        });
        const mem_uow = await sm.initialize();
        expect(mem_uow).toBeInstanceOf(MemoryUnitOfWork);
        await mem_uow.categoryRepo.upsertCategory({
            id: 'c1',
            name: 'Cat',
            parent_id: null,
            is_active: true,
            sort_order: 0,
            created_at: 'a',
            updated_at: 'a',
        });
        backend.should_fail = false;
        const ok = await sm.tryRecover();
        expect(ok).toBe(true);
        expect(sm.getStorageState().mode).toBe('sqlite');
        const sqlite_uow = sm.getUnitOfWork();
        const cats = await sqlite_uow.categoryRepo.getCategories();
        expect(cats.some((c) => c.id === 'c1')).toBe(true);
        sm.dispose();
    });

    it('tryRecover 실패 시 memory_fallback와 메모리 UoW를 유지한다', async () => {
        const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        const backend = new MutableFailBackend();
        const sm = new StorageManager({
            sqlite_options: {},
            backend,
            logger,
            retry_options: fast_retry,
        });
        const mem_uow = await sm.initialize();
        await mem_uow.categoryRepo.upsertCategory({
            id: 'orphan',
            name: 'Bad',
            parent_id: 'missing_parent',
            is_active: true,
            sort_order: 0,
            created_at: 'a',
            updated_at: 'a',
        });
        backend.should_fail = false;
        const ok = await sm.tryRecover();
        expect(ok).toBe(false);
        expect(sm.getStorageState().mode).toBe('memory_fallback');
        const still_mem = sm.getUnitOfWork();
        const cats = await still_mem.categoryRepo.getCategories();
        expect(cats.some((c) => c.id === 'orphan')).toBe(true);
        expect(logger.warn).toHaveBeenCalled();
        sm.dispose();
    });
});
