import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { StateTransitionError, ValidationError } from '../errors';
import { HistoryService } from './history_service';
import { JobService } from './job_service';

describe('JobService', () => {
    let uow: MemoryUnitOfWork;
    let history_service: HistoryService;
    let job_service: JobService;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
        history_service = new HistoryService(uow);
        job_service = new JobService(uow, history_service);
    });

    it('UC-JOB-001: createJob: 제목 sanitize + Job 생성', async () => {
        const job = await job_service.createJob({ title: '  Hello  ' });
        expect(job.title).toBe('Hello');
        expect(job.status).toBe('pending');
        const stored = await uow.jobRepo.getJobById(job.id);
        expect(stored?.title).toBe('Hello');
    });

    it('createJob: 빈 제목 시 ValidationError', async () => {
        await expect(job_service.createJob({ title: '   ' })).rejects.toThrow(ValidationError);
    });

    it('createJob: HTML 태그 제거', async () => {
        const job = await job_service.createJob({ title: '<b>Safe</b>' });
        expect(job.title).toBe('Safe');
    });

    it('UC-JOB-002: getJobs: 필터 없이 전체', async () => {
        await job_service.createJob({ title: 'A' });
        await job_service.createJob({ title: 'B' });
        const jobs = await job_service.getJobs();
        expect(jobs.length).toBeGreaterThanOrEqual(2);
    });

    it('getJobs: status 필터', async () => {
        const j = await job_service.createJob({ title: 'x' });
        await job_service.transitionStatus(j.id, 'in_progress', 'go');
        const in_prog = await job_service.getJobs({ status: 'in_progress' });
        expect(in_prog.some((x) => x.id === j.id)).toBe(true);
    });

    it('getJobById: 존재/미존재', async () => {
        const j = await job_service.createJob({ title: 'y' });
        expect(await job_service.getJobById(j.id)).not.toBeNull();
        expect(await job_service.getJobById('missing-id')).toBeNull();
    });

    it('UC-JOB-003: updateJob: 제목 변경', async () => {
        const j = await job_service.createJob({ title: 'old' });
        const updated = await job_service.updateJob(j.id, { title: 'new' });
        expect(updated.title).toBe('new');
    });

    it('updateJob: 미존재 Job 시 ValidationError', async () => {
        await expect(job_service.updateJob('nope', { title: 'x' })).rejects.toThrow(ValidationError);
    });

    it('UC-JOB-005: deleteJob: pending Job 삭제 (cascade)', async () => {
        const j = await job_service.createJob({ title: 'del' });
        await job_service.deleteJob(j.id);
        expect(await job_service.getJobById(j.id)).toBeNull();
    });

    it('UC-JOB-008: deleteJob: in_progress Job 삭제 시 StateTransitionError', async () => {
        const j = await job_service.createJob({ title: 'run' });
        await job_service.transitionStatus(j.id, 'in_progress', 'start');
        await expect(job_service.deleteJob(j.id)).rejects.toThrow(StateTransitionError);
    });

    it('transitionStatus: 유효한 전환 (pending→in_progress)', async () => {
        const j = await job_service.createJob({ title: 't' });
        await job_service.transitionStatus(j.id, 'in_progress', 'r');
        const got = await job_service.getJobById(j.id);
        expect(got?.status).toBe('in_progress');
    });

    it('UC-JOB-004: transitionStatus: 무효한 전환 시 StateTransitionError', async () => {
        const j = await job_service.createJob({ title: 't' });
        await expect(job_service.transitionStatus(j.id, 'paused', 'bad')).rejects.toThrow(StateTransitionError);
    });

    it('transitionStatus: 미존재 Job 시 ValidationError', async () => {
        await expect(job_service.transitionStatus('missing', 'in_progress', 'r')).rejects.toThrow(ValidationError);
    });

    it('switchJob: in_progress → paused + 새 Job → in_progress (원자적)', async () => {
        const from = await job_service.createJob({ title: 'from' });
        const to = await job_service.createJob({ title: 'to' });
        await job_service.transitionStatus(from.id, 'in_progress', 'start');
        await job_service.switchJob(from.id, to.id, '전환');
        const from_after = await job_service.getJobById(from.id);
        const to_after = await job_service.getJobById(to.id);
        expect(from_after?.status).toBe('paused');
        expect(to_after?.status).toBe('in_progress');
    });
});
