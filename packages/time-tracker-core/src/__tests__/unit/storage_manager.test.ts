// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import type { IStorageBackend } from '../../adapters/storage/sqlite/storage_backend';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import { StorageManager } from '../../adapters/storage/storage_manager';

class MemoryStorageBackend implements IStorageBackend {
    private data: Uint8Array | null = null;

    async read(): Promise<Uint8Array | null> {
        return this.data;
    }

    async write(data: Uint8Array): Promise<void> {
        this.data = new Uint8Array(data);
    }

    async exists(): Promise<boolean> {
        return this.data !== null;
    }
}

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

describe('StorageManager', () => {
    it('UC-STORE-026: SQLite 초기화 실패 시 MemoryUnitOfWork와 memory_fallback 상태', async () => {
        const logger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
        const sm = new StorageManager({
            sqlite_options: {},
            backend: new ThrowingBackend(),
            logger,
            retry_options: { max_attempts: 2, base_delay_ms: 0, sleep: async () => {} },
        });
        const uow = await sm.initialize();
        expect(uow).toBeInstanceOf(MemoryUnitOfWork);
        expect(sm.getStorageState().mode).toBe('memory_fallback');
        expect(logger.warn).toHaveBeenCalled();
        sm.dispose();
    });

    it('UC-STORE-027: tryRecover는 memory_fallback이 아니면 false', async () => {
        const backend = new MemoryStorageBackend();
        const sm = new StorageManager({ sqlite_options: {}, backend });
        await sm.initialize();
        expect(await sm.tryRecover()).toBe(false);
        sm.dispose();
    });

    it('UC-STORE-028: tryRecover: SQLite 재오픈 후 메모리 데이터를 병합', async () => {
        const backend = new MutableFailBackend();
        const sm = new StorageManager({
            sqlite_options: {},
            backend,
            retry_options: { max_attempts: 2, base_delay_ms: 0, sleep: async () => {} },
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
});
