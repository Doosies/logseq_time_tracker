import { describe, expect, it } from 'vitest';
import type { Job } from '../../../types/job';
import { MemoryJobRepository } from './memory_job_repository';

function makeJob(overrides: Partial<Job> = {}): Job {
    const now = '2025-01-01T00:00:00.000Z';
    return {
        id: 'job-1',
        title: 'T',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

describe('MemoryJobRepository', () => {
    it('UC-STORE-002: getJobById: 존재하지 않는 ID → null 반환', async () => {
        const repo = new MemoryJobRepository();
        expect(await repo.getJobById('non-existent-job-id')).toBeNull();
    });

    it('UC-STORE-001: upsertJob + getJobById로 Job CRUD', async () => {
        const repo = new MemoryJobRepository();
        const job = makeJob();
        await repo.upsertJob(job);
        const got = await repo.getJobById('job-1');
        expect(got).not.toBeNull();
        expect(got?.title).toBe('T');
    });

    it('getJobs: 빈 상태일 때 빈 배열', async () => {
        const repo = new MemoryJobRepository();
        expect(await repo.getJobs()).toEqual([]);
    });

    it('UC-STORE-003: getJobsByStatus: 특정 상태의 Job만 반환', async () => {
        const repo = new MemoryJobRepository();
        await repo.upsertJob(makeJob({ id: 'a', status: 'pending' }));
        await repo.upsertJob(makeJob({ id: 'b', status: 'in_progress' }));
        const pending = await repo.getJobsByStatus('pending');
        expect(pending).toHaveLength(1);
        expect(pending[0]?.id).toBe('a');
    });

    it('getActiveJob: in_progress Job 반환 (없으면 null)', async () => {
        const repo = new MemoryJobRepository();
        expect(await repo.getActiveJob()).toBeNull();
        await repo.upsertJob(makeJob({ id: 'x', status: 'in_progress' }));
        const active = await repo.getActiveJob();
        expect(active?.id).toBe('x');
    });

    it('updateJobStatus: 상태 변경 확인', async () => {
        const repo = new MemoryJobRepository();
        await repo.upsertJob(makeJob({ status: 'pending' }));
        await repo.updateJobStatus('job-1', 'in_progress', '2025-02-01T00:00:00.000Z');
        const got = await repo.getJobById('job-1');
        expect(got?.status).toBe('in_progress');
        expect(got?.updated_at).toBe('2025-02-01T00:00:00.000Z');
    });

    it('deleteJob: 삭제 후 getJobById null', async () => {
        const repo = new MemoryJobRepository();
        await repo.upsertJob(makeJob());
        await repo.deleteJob('job-1');
        expect(await repo.getJobById('job-1')).toBeNull();
    });

    it('structuredClone 격리: 저장 후 원본 수정해도 저장된 값 불변', async () => {
        const repo = new MemoryJobRepository();
        const job = makeJob({ title: 'original' });
        await repo.upsertJob(job);
        job.title = 'mutated';
        const got = await repo.getJobById('job-1');
        expect(got?.title).toBe('original');
    });
});
