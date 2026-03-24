import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { AppContext } from './context';
import { ConsoleLogger } from '../adapters/logger';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { createServices } from '../services';
import { createTimerStore } from '../stores/timer_store.svelte';
import { createJobStore } from '../stores/job_store.svelte';
import { createToastStore } from '../stores/toast_store.svelte';

export async function initializeApp(options?: { logger?: ILogger; uow?: IUnitOfWork }): Promise<AppContext> {
    const logger = options?.logger ?? new ConsoleLogger();

    const uow = options?.uow ?? new MemoryUnitOfWork();
    const services = createServices(uow, logger);

    const timer_store = createTimerStore();
    const job_store = createJobStore();
    const toast_store = createToastStore();

    await services.category_service.seedDefaults();

    try {
        const saved_timer = await uow.settingsRepo.getSetting('active_timer');
        if (saved_timer) {
            const job = await uow.jobRepo.getJobById(saved_timer.job_id);
            const categories = await uow.categoryRepo.getCategories();
            const category = categories.find((c) => c.id === saved_timer.category_id);

            if (job && category) {
                timer_store.restore(
                    job,
                    category,
                    saved_timer.started_at,
                    saved_timer.is_paused,
                    saved_timer.accumulated_ms,
                    saved_timer.paused_at,
                );
                logger.info('Timer state restored', { job_id: job.id });
            } else {
                await uow.settingsRepo.deleteSetting('active_timer');
                logger.warn('Active timer state cleared: referenced job or category not found', {
                    job_id: saved_timer.job_id,
                    category_id: saved_timer.category_id,
                });
            }
        }
    } catch (e) {
        logger.error('Failed to restore timer state', { error: String(e) });
    }

    const jobs = await services.job_service.getJobs();
    job_store.setJobs(jobs);

    return {
        services,
        stores: { timer_store, job_store, toast_store },
        uow,
        logger,
    };
}
