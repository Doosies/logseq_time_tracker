// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import type { Job } from '../../types/job';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteAdapter } from '../../adapters/storage/sqlite/sqlite_adapter';
import { SqliteUnitOfWork } from '../../adapters/storage/sqlite/sqlite_unit_of_work';
import type { IStorageBackend } from '../../adapters/storage/sqlite/storage_backend';

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

function makeJob(id: string): Job {
    const now = '2025-01-01T00:00:00.000Z';
    return {
        id,
        title: 'T',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
    };
}

async function createMigratedUow(backend: IStorageBackend): Promise<{ uow: SqliteUnitOfWork; adapter: SqliteAdapter }> {
    const adapter = new SqliteAdapter(backend);
    await adapter.initialize({});
    new MigrationRunner(adapter.getDatabase(), ALL_MIGRATIONS).run();
    const uow = new SqliteUnitOfWork(adapter);
    return { uow, adapter };
}

describe('SqliteUnitOfWork', () => {
    it('모든 Repository 프로퍼티 접근 가능', async () => {
        const { uow } = await createMigratedUow(new MemoryStorageBackend());
        expect(uow.jobRepo).toBeDefined();
        expect(uow.categoryRepo).toBeDefined();
        expect(uow.timeEntryRepo).toBeDefined();
        expect(uow.historyRepo).toBeDefined();
        expect(uow.externalRefRepo).toBeDefined();
        expect(uow.settingsRepo).toBeDefined();
        expect(uow.templateRepo).toBeDefined();
        expect(uow.jobCategoryRepo).toBeDefined();
        expect(uow.dataFieldRepo).toBeDefined();
    });

    it('transaction 성공 시 데이터 유지하고 persist 호출', async () => {
        const backend = new MemoryStorageBackend();
        const { uow, adapter } = await createMigratedUow(backend);
        const persist_spy = vi.spyOn(adapter, 'persist');

        await uow.transaction(async (tx) => {
            await tx.jobRepo.upsertJob(makeJob('j1'));
        });

        expect(persist_spy).toHaveBeenCalledTimes(1);
        const got = await uow.jobRepo.getJobById('j1');
        expect(got).not.toBeNull();
    });

    it('transaction 실패 시 롤백되어 데이터 없음', async () => {
        const { uow } = await createMigratedUow(new MemoryStorageBackend());

        await expect(
            uow.transaction(async (tx) => {
                await tx.jobRepo.upsertJob(makeJob('j1'));
                throw new Error('fail');
            }),
        ).rejects.toThrow('fail');

        expect(await uow.jobRepo.getJobById('j1')).toBeNull();
    });

    it('중첩 transaction: 내부는 별도 BEGIN 없이 조인, 성공 시 persist는 외부 1회', async () => {
        const backend = new MemoryStorageBackend();
        const { uow, adapter } = await createMigratedUow(backend);
        const persist_spy = vi.spyOn(adapter, 'persist');
        const db = adapter.getDatabase();
        const run_spy = vi.spyOn(db, 'run');

        await uow.transaction(async (outer) => {
            await outer.jobRepo.upsertJob(makeJob('outer'));
            await outer.transaction(async (inner) => {
                await inner.jobRepo.upsertJob(makeJob('inner'));
            });
        });

        expect(await uow.jobRepo.getJobById('outer')).not.toBeNull();
        expect(await uow.jobRepo.getJobById('inner')).not.toBeNull();
        expect(persist_spy).toHaveBeenCalledTimes(1);

        const begin_calls = run_spy.mock.calls.filter((c) => String(c[0]).includes('BEGIN'));
        expect(begin_calls.length).toBe(1);
    });

    it('중첩 transaction: 외부 실패 시 전체 롤백', async () => {
        const { uow } = await createMigratedUow(new MemoryStorageBackend());

        await expect(
            uow.transaction(async (outer) => {
                await outer.jobRepo.upsertJob(makeJob('outer'));
                await outer.transaction(async (inner) => {
                    await inner.jobRepo.upsertJob(makeJob('inner'));
                });
                throw new Error('outer fail');
            }),
        ).rejects.toThrow('outer fail');

        expect(await uow.jobRepo.getJobById('outer')).toBeNull();
        expect(await uow.jobRepo.getJobById('inner')).toBeNull();
    });
});
