import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import type { ILogger } from '../../adapters/logger';
import { createServices } from '../../services';

const silent_logger: ILogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

describe('타이머 워크플로우', () => {
    let uow: MemoryUnitOfWork;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'));
        uow = new MemoryUnitOfWork();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('Job 생성 → 타이머 시작 → 시간 경과 → 정지 → TimeEntry 생성 확인', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '통합 작업' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:07.000Z'));
        const entry = await services.timer_service.stop('완료');
        expect(entry).not.toBeNull();
        expect(entry!.job_id).toBe(job.id);
        expect(entry!.category_id).toBe(category.id);
        expect(entry!.duration_seconds).toBeGreaterThanOrEqual(6);
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('completed');
        services.timer_service.dispose();
    });

    it('Job 생성 → 시작 → 일시정지 → 재개 → 정지 → 전체 경과 시간 확인', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '구간 누적' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:02.000Z'));
        await services.timer_service.pause('쉼');
        vi.setSystemTime(new Date('2025-06-01T12:00:05.000Z'));
        await services.timer_service.resume('다시');
        vi.setSystemTime(new Date('2025-06-01T12:00:07.000Z'));
        const entry = await services.timer_service.stop('끝');
        expect(entry).not.toBeNull();
        expect(entry!.duration_seconds).toBe(4);
        services.timer_service.dispose();
    });

    it('Job 생성 → 시작 → 취소 → [cancelled] 접두사 note', async () => {
        const services = createServices(uow, silent_logger);
        const job = await services.job_service.createJob({ title: '취소 테스트' });
        const category = await services.category_service.createCategory('분류');
        await services.timer_service.start(job, category);
        vi.setSystemTime(new Date('2025-06-01T12:00:04.000Z'));
        const entry = await services.timer_service.cancel('사유');
        expect(entry).not.toBeNull();
        expect(entry!.note.startsWith('[cancelled]')).toBe(true);
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('cancelled');
        services.timer_service.dispose();
    });
});
