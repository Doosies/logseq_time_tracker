import { describe, it, expect, vi } from 'vitest';
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
