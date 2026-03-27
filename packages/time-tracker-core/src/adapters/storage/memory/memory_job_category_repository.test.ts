import { describe, expect, it } from 'vitest';

import type { JobCategory } from '../../../types/job_category';
import { MemoryJobCategoryRepository } from './memory_job_category_repository';

function makeJobCategory(overrides: Partial<JobCategory> = {}): JobCategory {
    return {
        id: 'jc-1',
        job_id: 'job-1',
        category_id: 'cat-1',
        is_default: false,
        created_at: '2025-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('MemoryJobCategoryRepository', () => {
    it('UC-MEM-019: upsert 후 getJobCategories로 job_id 기준 조회된다', async () => {
        const repo = new MemoryJobCategoryRepository();
        const jc = makeJobCategory({ id: 'a', job_id: 'j1', created_at: '2025-01-02T00:00:00.000Z' });
        await repo.upsertJobCategory(jc);
        const list = await repo.getJobCategories('j1');
        expect(list).toHaveLength(1);
        expect(list[0]?.id).toBe('a');
    });

    it('UC-MEM-020: getCategoryJobs로 category_id 기준 조회된다', async () => {
        const repo = new MemoryJobCategoryRepository();
        await repo.upsertJobCategory(
            makeJobCategory({ id: 'x', job_id: 'j1', category_id: 'c99', created_at: '2025-01-01T00:00:00.000Z' }),
        );
        await repo.upsertJobCategory(
            makeJobCategory({ id: 'y', job_id: 'j2', category_id: 'c99', created_at: '2025-01-02T00:00:00.000Z' }),
        );
        const list = await repo.getCategoryJobs('c99');
        expect(list.map((r) => r.id)).toEqual(['x', 'y']);
    });

    it('UC-MEM-021: deleteJobCategory 후 해당 job 기준 조회는 빈 배열이다', async () => {
        const repo = new MemoryJobCategoryRepository();
        await repo.upsertJobCategory(makeJobCategory({ id: 'del-me', job_id: 'j1' }));
        await repo.deleteJobCategory('del-me');
        expect(await repo.getJobCategories('j1')).toEqual([]);
    });

    it('UC-MEM-022: deleteByJobId로 해당 job의 관계가 모두 삭제된다', async () => {
        const repo = new MemoryJobCategoryRepository();
        await repo.upsertJobCategory(makeJobCategory({ id: '1', job_id: 'j1' }));
        await repo.upsertJobCategory(makeJobCategory({ id: '2', job_id: 'j1', category_id: 'cat-2' }));
        await repo.upsertJobCategory(makeJobCategory({ id: '3', job_id: 'j2' }));
        await repo.deleteByJobId('j1');
        expect(await repo.getJobCategories('j1')).toEqual([]);
        expect(await repo.getJobCategories('j2')).toHaveLength(1);
    });

    it('UC-MEM-023: structuredClone 격리 — upsert 후 원본 변경해도 저장값은 불변', async () => {
        const repo = new MemoryJobCategoryRepository();
        const jc = makeJobCategory({ job_id: 'job-1' });
        await repo.upsertJobCategory(jc);
        jc.job_id = 'mutated';
        const list = await repo.getJobCategories('job-1');
        expect(list).toHaveLength(1);
        expect(list[0]?.job_id).toBe('job-1');
    });
});
