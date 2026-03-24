import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { HistoryService } from './history_service';

describe('HistoryService', () => {
    let uow: MemoryUnitOfWork;
    let history_service: HistoryService;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
        history_service = new HistoryService(uow);
    });

    it('recordTransition: JobHistory 생성 확인', async () => {
        await history_service.recordTransition('job-1', 'pending', 'in_progress', '시작');
        const list = await history_service.getJobHistory('job-1');
        expect(list).toHaveLength(1);
        expect(list[0]?.job_id).toBe('job-1');
        expect(list[0]?.from_status).toBe('pending');
        expect(list[0]?.to_status).toBe('in_progress');
        expect(list[0]?.reason).toBe('시작');
    });

    it('getJobHistory: job_id로 이력 조회', async () => {
        await history_service.recordTransition('a', null, 'pending', 'init');
        await history_service.recordTransition('b', 'pending', 'in_progress', 'go');
        const for_a = await history_service.getJobHistory('a');
        const for_b = await history_service.getJobHistory('b');
        expect(for_a).toHaveLength(1);
        expect(for_b).toHaveLength(1);
        expect(for_b[0]?.job_id).toBe('b');
    });

    it('getHistoryByPeriod: 필터로 이력 조회', async () => {
        await history_service.recordTransition('j', 'pending', 'in_progress', 'r1');
        const all = await uow.historyRepo.getJobHistory('j');
        const occurred = all[0]?.occurred_at;
        expect(occurred).toBeDefined();
        const occurred_at = occurred as string;
        const filtered = await history_service.getHistoryByPeriod({
            job_id: 'j',
            from_date: occurred_at,
            to_date: occurred_at,
        });
        expect(filtered.length).toBeGreaterThanOrEqual(1);
        expect(filtered.every((h) => h.job_id === 'j')).toBe(true);
    });
});
