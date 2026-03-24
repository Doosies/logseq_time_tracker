import { describe, expect, it } from 'vitest';
import type { Job } from '../../../types/job';
import { MemoryUnitOfWork } from './memory_unit_of_work';

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

describe('MemoryUnitOfWork', () => {
    it('모든 Repository 프로퍼티 접근 가능', () => {
        const uow = new MemoryUnitOfWork();
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

    it('transaction 성공 시 데이터 유지', async () => {
        const uow = new MemoryUnitOfWork();
        await uow.transaction(async (tx) => {
            await tx.jobRepo.upsertJob(makeJob('j1'));
        });
        const got = await uow.jobRepo.getJobById('j1');
        expect(got).not.toBeNull();
    });

    it('transaction 실패 시 롤백 (저장한 Job 복원됨)', async () => {
        const uow = new MemoryUnitOfWork();
        await expect(
            uow.transaction(async (tx) => {
                await tx.jobRepo.upsertJob(makeJob('j1'));
                throw new Error('fail');
            }),
        ).rejects.toThrow('fail');
        expect(await uow.jobRepo.getJobById('j1')).toBeNull();
    });

    it('중첩 트랜잭션: 외부 실패 시 전체 롤백', async () => {
        const uow = new MemoryUnitOfWork();
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
