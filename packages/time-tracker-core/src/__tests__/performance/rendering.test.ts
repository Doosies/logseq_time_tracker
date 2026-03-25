import { describe, expect, it } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import { JobService } from '../../services/job_service';
import { HistoryService } from '../../services/history_service';
import { CategoryService } from '../../services/category_service';
import type { TimeEntry } from '../../types/time_entry';
import { generateId } from '../../utils';

function makeTimeEntrySeed(
    job_id: string,
    category_id: string,
    index: number,
    base_ms: number,
): TimeEntry {
    const started = new Date(base_ms + index * 1000).toISOString();
    const ended = new Date(base_ms + index * 1000 + 60_000).toISOString();
    const duration_seconds = 60;
    return {
        id: generateId(),
        job_id,
        category_id,
        started_at: started,
        ended_at: ended,
        duration_seconds,
        note: '',
        is_manual: true,
        created_at: started,
        updated_at: started,
    };
}

describe('Performance benchmarks (UC-PERF)', () => {
    it('UC-PERF-003: 100개 Job 생성 및 조회 < 500ms', async () => {
        const uow = new MemoryUnitOfWork();
        const history_service = new HistoryService(uow);
        const job_service = new JobService(uow, history_service);
        for (let i = 0; i < 100; i += 1) {
            await job_service.createJob({ title: `job-${i}` });
        }
        const started = performance.now();
        await job_service.getJobs();
        const elapsed_ms = performance.now() - started;
        expect(elapsed_ms).toBeLessThan(500);
    });

    it('UC-PERF-004: 10,000건 TimeEntry 쿼리 < 500ms', async () => {
        const uow = new MemoryUnitOfWork();
        const history_service = new HistoryService(uow);
        const job_service = new JobService(uow, history_service);
        const category_service = new CategoryService(uow);
        const job = await job_service.createJob({ title: 'perf-job' });
        const cat = await category_service.createCategory('perf-cat');
        const base_ms = Date.parse('2025-06-01T00:00:00.000Z');
        for (let i = 0; i < 10_000; i += 1) {
            const entry = makeTimeEntrySeed(job.id, cat.id, i, base_ms);
            await uow.timeEntryRepo.upsertTimeEntry(entry);
        }
        const started = performance.now();
        await uow.timeEntryRepo.getTimeEntries({ job_id: job.id });
        const elapsed_ms = performance.now() - started;
        expect(elapsed_ms).toBeLessThan(500);
    });
});
