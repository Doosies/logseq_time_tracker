import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import type { ILogger } from '../../adapters/logger';
import { createServices } from '../../services';
import { StateTransitionError } from '../../errors';
import { generateId } from '../../utils';

const silent_logger: ILogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

describe('Job 생명주기', () => {
    let uow: MemoryUnitOfWork;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
    });

    it('UC-FSM-001: 생성 → pending 확인', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '신규' });
        expect(job.status).toBe('pending');
    });

    it('UC-FSM-001: pending → in_progress 전환', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '진행' });
        await services.job_service.transitionStatus(job.id, 'in_progress', '시작');
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('in_progress');
    });

    it('UC-FSM-001: in_progress → completed → pending (재오픈)', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '재오픈' });
        await services.job_service.transitionStatus(job.id, 'in_progress', '시작');
        await services.job_service.transitionStatus(job.id, 'completed', '끝');
        await services.job_service.transitionStatus(job.id, 'pending', '다시');
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('pending');
    });

    it('UC-FSM-001: pending Job 삭제 → TimeEntry도 삭제 (cascade)', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '삭제' });
        const category = await services.category_service.createCategory('cat');
        const now = new Date().toISOString();
        await uow.timeEntryRepo.upsertTimeEntry({
            id: generateId(),
            job_id: job.id,
            category_id: category.id,
            started_at: now,
            ended_at: now,
            duration_seconds: 120,
            note: '',
            is_manual: false,
            created_at: now,
            updated_at: now,
        });
        const before = await uow.timeEntryRepo.getTimeEntries({ job_id: job.id });
        expect(before.length).toBe(1);
        await services.job_service.deleteJob(job.id);
        const after = await uow.timeEntryRepo.getTimeEntries({ job_id: job.id });
        expect(after).toHaveLength(0);
    });

    it('UC-FSM-001: in_progress Job 삭제 시도 → StateTransitionError', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '진행중 삭제' });
        await services.job_service.transitionStatus(job.id, 'in_progress', '시작');
        await expect(services.job_service.deleteJob(job.id)).rejects.toThrow(StateTransitionError);
    });
});
