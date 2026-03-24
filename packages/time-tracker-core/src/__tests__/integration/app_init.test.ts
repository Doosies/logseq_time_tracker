import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILogger } from '../../adapters/logger';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import { initializeApp } from '../../app/initialize';
import type { ActiveTimerState } from '../../types/settings';
import { createServices } from '../../services';

const silent_logger: ILogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};

describe('앱 초기화', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initializeApp() → AppContext 반환', async () => {
        const ctx = await initializeApp({ logger: silent_logger });
        expect(ctx.services).toBeDefined();
        expect(ctx.stores.timer_store).toBeDefined();
        expect(ctx.stores.job_store).toBeDefined();
        expect(ctx.stores.toast_store).toBeDefined();
        expect(ctx.uow).toBeInstanceOf(MemoryUnitOfWork);
        expect(ctx.logger).toBe(silent_logger);
    });

    it('seedDefaults 호출 → 기본 카테고리 4개 확인', async () => {
        const ctx = await initializeApp({ logger: silent_logger });
        const categories = await ctx.services.category_service.getCategories();
        expect(categories).toHaveLength(4);
        const names = categories.map((c) => c.name);
        for (const expected_name of ['개발', '분석', '회의', '기타']) {
            expect(names).toContain(expected_name);
        }
    });

    it('저장된 ActiveTimerState → 타이머 복구 확인', async () => {
        const uow = new MemoryUnitOfWork();
        const services = createServices(uow, silent_logger);
        await services.category_service.seedDefaults();
        const job = await services.job_service.createJob({ title: '복구' });
        const categories = await services.category_service.getCategories();
        const category = categories[0]!;
        const state: ActiveTimerState = {
            version: 1,
            job_id: job.id,
            category_id: category.id,
            started_at: '2025-06-01T10:00:00.000Z',
            is_paused: true,
            accumulated_ms: 9000,
        };
        await uow.settingsRepo.setSetting('active_timer', state);
        const ctx = await initializeApp({ logger: silent_logger, uow });
        expect(ctx.stores.timer_store.state.active_job?.id).toBe(job.id);
        expect(ctx.stores.timer_store.state.accumulated_ms).toBe(9000);
        expect(ctx.stores.timer_store.state.is_paused).toBe(true);
        expect(ctx.stores.timer_store.state.current_segment_start).toBeNull();
        expect(ctx.services.timer_service.getActiveJob()?.id).toBe(job.id);
    });

    it('active_timer 없이 in_progress job만 있으면 시작 시 paused로 정리', async () => {
        const uow = new MemoryUnitOfWork();
        const services = createServices(uow, silent_logger);
        await services.category_service.seedDefaults();
        const job = await services.job_service.createJob({ title: '고아' });
        const now = new Date().toISOString();
        await uow.jobRepo.updateJobStatus(job.id, 'in_progress', now);
        const ctx = await initializeApp({ logger: silent_logger, uow });
        const stored = await services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('paused');
        expect(ctx.services.timer_service.getActiveJob()).toBeNull();
        expect(silent_logger.warn).toHaveBeenCalledWith(
            'Orphan in_progress jobs paused on startup',
            expect.objectContaining({ count: 1, job_ids: [job.id] }),
        );
    });

    it('active_timer 복원 성공 시 고아 in_progress 정리(pauseOrphan)가 실행되지 않음', async () => {
        const uow = new MemoryUnitOfWork();
        const services = createServices(uow, silent_logger);
        await services.category_service.seedDefaults();
        const job = await services.job_service.createJob({ title: '복원 유지' });
        const categories = await services.category_service.getCategories();
        const category = categories[0]!;
        const now = new Date().toISOString();
        await uow.jobRepo.updateJobStatus(job.id, 'in_progress', now);
        const state: ActiveTimerState = {
            version: 1,
            job_id: job.id,
            category_id: category.id,
            started_at: '2025-06-01T10:00:00.000Z',
            is_paused: false,
            accumulated_ms: 0,
        };
        await uow.settingsRepo.setSetting('active_timer', state);
        const ctx = await initializeApp({ logger: silent_logger, uow });
        const stored = await ctx.services.job_service.getJobById(job.id);
        expect(stored?.status).toBe('in_progress');
        expect(ctx.services.timer_service.getActiveJob()?.id).toBe(job.id);
        expect(silent_logger.warn).not.toHaveBeenCalledWith(
            'Orphan in_progress jobs paused on startup',
            expect.anything(),
        );
    });

    it('저장된 ActiveTimerState에서 job이 없는 경우 → 설정 삭제', async () => {
        const uow = new MemoryUnitOfWork();
        const services = createServices(uow, silent_logger);
        await services.category_service.seedDefaults();
        const categories = await services.category_service.getCategories();
        const category = categories[0]!;
        const state: ActiveTimerState = {
            version: 1,
            job_id: 'no-such-job',
            category_id: category.id,
            started_at: new Date().toISOString(),
            is_paused: false,
            accumulated_ms: 0,
        };
        await uow.settingsRepo.setSetting('active_timer', state);
        const ctx = await initializeApp({ logger: silent_logger, uow });
        const saved = await uow.settingsRepo.getSetting('active_timer');
        expect(saved).toBeNull();
        expect(ctx.stores.timer_store.state.active_job).toBeNull();
    });
});
