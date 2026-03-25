import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import { createServices } from '../../services';
import { createJobStore } from '../../stores/job_store.svelte';
import type { ILogger } from '../../adapters/logger';

const silent_logger: ILogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

describe('FSM 저장소 통합 (UC-FSM-004/006)', () => {
    let uow: MemoryUnitOfWork;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
    });

    it('UC-FSM-004: JobService 상태 3회 전환 시 HistoryService에 순서대로 3건 기록된다', async () => {
        const { job_service, history_service } = createServices(uow, silent_logger);
        const job = await job_service.createJob({ title: 'FSM 이력 통합' });

        await job_service.transitionStatus(job.id, 'in_progress', '시작');
        await job_service.transitionStatus(job.id, 'paused', '일시정지');
        await job_service.transitionStatus(job.id, 'in_progress', '재개');

        const history_rows = await history_service.getJobHistory(job.id);
        expect(history_rows).toHaveLength(3);

        expect(history_rows[0]?.from_status).toBe('pending');
        expect(history_rows[0]?.to_status).toBe('in_progress');
        expect(history_rows[0]?.reason).toBe('시작');

        expect(history_rows[1]?.from_status).toBe('in_progress');
        expect(history_rows[1]?.to_status).toBe('paused');
        expect(history_rows[1]?.reason).toBe('일시정지');

        expect(history_rows[2]?.from_status).toBe('paused');
        expect(history_rows[2]?.to_status).toBe('in_progress');
        expect(history_rows[2]?.reason).toBe('재개');
    });

    it('UC-FSM-006: createJob 후 addJob 호출 시 JobStore에 새 Job이 반영된다', async () => {
        const { job_service } = createServices(uow, silent_logger);
        const store = createJobStore();

        const result = await job_service.createJob({ title: '스토어 동기화' });
        store.addJob(result);

        expect(store.jobs).toHaveLength(1);
        expect(store.jobs[0]?.id).toBe(result.id);
        expect(store.jobs[0]?.title).toBe('스토어 동기화');
    });
});
