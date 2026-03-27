import { describe, expect, it } from 'vitest';

import type { JobHistory } from '../../../types/history';
import { MemoryHistoryRepository } from './memory_history_repository';

function makeHistory(overrides: Partial<JobHistory> = {}): JobHistory {
    return {
        id: 'h-1',
        job_id: 'job-1',
        from_status: null,
        to_status: 'pending',
        reason: '',
        occurred_at: '2025-01-01T12:00:00.000Z',
        created_at: '2025-01-01T12:00:00.000Z',
        ...overrides,
    };
}

describe('MemoryHistoryRepository', () => {
    it('UC-MEM-032: appendJobHistory 후 getJobHistory로 job_id 기준 조회된다', async () => {
        const repo = new MemoryHistoryRepository();
        await repo.appendJobHistory(makeHistory({ id: 'a', job_id: 'j1', occurred_at: '2025-01-02T00:00:00.000Z' }));
        const list = await repo.getJobHistory('j1');
        expect(list).toHaveLength(1);
        expect(list[0]?.id).toBe('a');
    });

    it('UC-MEM-033: getJobHistoryByPeriod로 기간·job_id에 맞는 항목만 반환된다', async () => {
        const repo = new MemoryHistoryRepository();
        await repo.appendJobHistory(makeHistory({ id: 'in', job_id: 'j1', occurred_at: '2025-01-02T00:00:00.000Z' }));
        await repo.appendJobHistory(
            makeHistory({ id: 'early', job_id: 'j1', occurred_at: '2025-01-01T00:00:00.000Z' }),
        );
        await repo.appendJobHistory(makeHistory({ id: 'late', job_id: 'j1', occurred_at: '2025-01-05T00:00:00.000Z' }));
        await repo.appendJobHistory(
            makeHistory({ id: 'other-job', job_id: 'j2', occurred_at: '2025-01-03T00:00:00.000Z' }),
        );
        const filtered = await repo.getJobHistoryByPeriod({
            job_id: 'j1',
            from_date: '2025-01-02T00:00:00.000Z',
            to_date: '2025-01-04T00:00:00.000Z',
        });
        expect(filtered.map((h) => h.id)).toEqual(['in']);
    });

    it('UC-MEM-034: deleteByJobId로 해당 job 이력이 모두 삭제된다', async () => {
        const repo = new MemoryHistoryRepository();
        await repo.appendJobHistory(makeHistory({ id: '1', job_id: 'j1' }));
        await repo.appendJobHistory(makeHistory({ id: '2', job_id: 'j1', occurred_at: '2025-01-02T00:00:00.000Z' }));
        await repo.appendJobHistory(makeHistory({ id: '3', job_id: 'j2' }));
        await repo.deleteByJobId('j1');
        expect(await repo.getJobHistory('j1')).toEqual([]);
        expect(await repo.getJobHistory('j2')).toHaveLength(1);
    });

    it('UC-MEM-035: structuredClone 격리 — append 후 원본 변경해도 저장값은 불변', async () => {
        const repo = new MemoryHistoryRepository();
        const item = makeHistory({ id: 'h1', job_id: 'job-1', reason: '원본' });
        await repo.appendJobHistory(item);
        item.reason = '변경';
        const list = await repo.getJobHistory('job-1');
        expect(list[0]?.reason).toBe('원본');
    });

    it('UC-MEM-036: getJobHistory는 occurred_at 오름차순으로 정렬된다', async () => {
        const repo = new MemoryHistoryRepository();
        await repo.appendJobHistory(makeHistory({ id: 'mid', job_id: 'j1', occurred_at: '2025-01-02T00:00:00.000Z' }));
        await repo.appendJobHistory(
            makeHistory({ id: 'first', job_id: 'j1', occurred_at: '2025-01-01T00:00:00.000Z' }),
        );
        await repo.appendJobHistory(makeHistory({ id: 'last', job_id: 'j1', occurred_at: '2025-01-03T00:00:00.000Z' }));
        const list = await repo.getJobHistory('j1');
        expect(list.map((h) => h.id)).toEqual(['first', 'mid', 'last']);
    });
});
