import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { TimerError } from '../errors';
import { HistoryService } from './history_service';
import { JobService } from './job_service';
import { CategoryService } from './category_service';
import { TimerService } from './timer_service';

describe('TimerService', () => {
    let uow: MemoryUnitOfWork;
    let history_service: HistoryService;
    let job_service: JobService;
    let category_service: CategoryService;
    let timer_service: TimerService;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'));
        uow = new MemoryUnitOfWork();
        history_service = new HistoryService(uow);
        job_service = new JobService(uow, history_service);
        category_service = new CategoryService(uow);
        timer_service = new TimerService(uow, job_service);
    });

    afterEach(() => {
        timer_service.dispose();
        vi.useRealTimers();
    });

    it('start: active_job이 없을 때 타이머 시작 + in_progress 전환', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('in_progress');
        expect(timer_service.getActiveJob()?.id).toBe(job.id);
    });

    it('start: 같은 Job으로 start → no-op (카테고리만 변경)', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat_a = await category_service.createCategory('A');
        const cat_b = await category_service.createCategory('B');
        await timer_service.start(job, cat_a);
        await timer_service.start(job, cat_b);
        const state = await uow.settingsRepo.getSetting('active_timer');
        expect(state?.category_id).toBe(cat_b.id);
    });

    it('start: 다른 Job으로 전환 시 기존 Job TimeEntry 생성 + paused 전환', async () => {
        const job_a = await job_service.createJob({ title: 'a' });
        const job_b = await job_service.createJob({ title: 'b' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job_a, cat);
        vi.setSystemTime(new Date('2025-06-01T12:00:05.000Z'));
        await timer_service.start(job_b, cat);
        const entries = await uow.timeEntryRepo.getTimeEntries({ job_id: job_a.id });
        expect(entries.length).toBeGreaterThanOrEqual(1);
        expect(entries[0]?.duration_seconds).toBeGreaterThanOrEqual(4);
        const a_after = await job_service.getJobById(job_a.id);
        const b_after = await job_service.getJobById(job_b.id);
        expect(a_after?.status).toBe('paused');
        expect(b_after?.status).toBe('in_progress');
    });

    it('pause: TimerError (active_job 없음)', async () => {
        await expect(timer_service.pause('r')).rejects.toThrow(TimerError);
    });

    it('pause: TimerError (이미 일시정지)', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        await timer_service.pause('p1');
        await expect(timer_service.pause('p2')).rejects.toThrow(TimerError);
    });

    it('pause: 정상 일시정지 + paused 전환', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        await timer_service.pause('stop');
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('paused');
    });

    it('resume: TimerError (active_job 없음)', async () => {
        await expect(timer_service.resume('r')).rejects.toThrow(TimerError);
    });

    it('resume: 정상 재개 + in_progress 전환', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        await timer_service.pause('p');
        await timer_service.resume('go');
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('in_progress');
    });

    it('stop: 경과 시간 > 0 → TimeEntry 생성 + completed', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        vi.setSystemTime(new Date('2025-06-01T12:00:03.000Z'));
        const entry = await timer_service.stop('done');
        expect(entry).not.toBeNull();
        expect(entry!.duration_seconds).toBeGreaterThanOrEqual(2);
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('completed');
    });

    it('stop: 경과 시간 === 0 → null 반환 (paused로 전환)', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        const entry = await timer_service.stop('zero');
        expect(entry).toBeNull();
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('paused');
    });

    it('cancel: 경과 시간 > 0 → TimeEntry with [cancelled] prefix', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        vi.setSystemTime(new Date('2025-06-01T12:00:04.000Z'));
        const entry = await timer_service.cancel('사유');
        expect(entry).not.toBeNull();
        expect(entry!.note.startsWith('[cancelled]')).toBe(true);
    });

    it('cancel: cancelled 상태 전환', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        await timer_service.cancel('x');
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('cancelled');
    });

    it('dispose: interval 정리 + 상태 초기화', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        timer_service.dispose();
        expect(timer_service.getActiveJob()).toBeNull();
    });

    it('getActiveJob: 활성 Job 반환', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        expect(timer_service.getActiveJob()?.title).toBe('j');
    });

    it('start: completed Job 재시작 시 pending 경유 후 in_progress', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        vi.setSystemTime(new Date('2025-06-01T12:00:03.000Z'));
        await timer_service.stop('done');
        const completed_job = await job_service.getJobById(job.id);
        expect(completed_job?.status).toBe('completed');
        await timer_service.start(completed_job!, cat);
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('in_progress');
    });

    it('start: cancelled Job 재시작 시 pending 경유 후 in_progress', async () => {
        const job = await job_service.createJob({ title: 'j' });
        const cat = await category_service.createCategory('c');
        await timer_service.start(job, cat);
        await timer_service.cancel('x');
        const cancelled_job = await job_service.getJobById(job.id);
        expect(cancelled_job?.status).toBe('cancelled');
        await timer_service.start(cancelled_job!, cat);
        const stored = await job_service.getJobById(job.id);
        expect(stored?.status).toBe('in_progress');
    });
});
