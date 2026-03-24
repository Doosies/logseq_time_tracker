import type { ILogger } from '../adapters/logger';
import type { IStorageBackend } from '../adapters/storage/sqlite/storage_backend';
import { IndexedDbBackend } from '../adapters/storage/sqlite/indexeddb_backend';
import type { SqliteAdapterOptions } from '../adapters/storage/sqlite/sqlite_adapter';
import { StorageManager, type StorageManagerOptions } from '../adapters/storage/storage_manager';
import type { WebLocksManager } from '../adapters/storage/web_locks';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { AppContext } from './context';
import { ConsoleLogger } from '../adapters/logger';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { createServices } from '../services';
import { createTimerStore } from '../stores/timer_store.svelte';
import { createJobStore } from '../stores/job_store.svelte';
import { createToastStore } from '../stores/toast_store.svelte';

export interface InitializeOptions {
    logger?: ILogger;
    uow?: IUnitOfWork;
    storage_mode?: 'memory' | 'sqlite';
    sqlite_options?: SqliteAdapterOptions;
    /** For tests or custom persistence; defaults to {@link IndexedDbBackend} when omitted in sqlite mode. */
    sqlite_backend?: IStorageBackend;
    /** Optional Web Locks around SQLite init when using {@link StorageManager}. */
    web_locks?: WebLocksManager;
}

async function createUnitOfWork(
    options: InitializeOptions,
): Promise<{ uow: IUnitOfWork; storage_manager?: StorageManager }> {
    if (options.uow !== undefined) {
        return { uow: options.uow };
    }
    if (options.storage_mode === 'sqlite') {
        const sqlite_opts = options.sqlite_options ?? {};
        const backend = options.sqlite_backend ?? new IndexedDbBackend(sqlite_opts.db_name ?? 'time-tracker.db');
        const sm_opts: StorageManagerOptions = {
            sqlite_options: sqlite_opts,
            backend,
        };
        if (options.logger !== undefined) {
            sm_opts.logger = options.logger;
        }
        if (options.web_locks !== undefined) {
            sm_opts.web_locks = options.web_locks;
        }
        const storage_manager = new StorageManager(sm_opts);
        const uow = await storage_manager.initialize();
        return { uow, storage_manager };
    }
    return { uow: new MemoryUnitOfWork() };
}

export async function initializeApp(options: InitializeOptions = {}): Promise<AppContext> {
    const logger = options.logger ?? new ConsoleLogger();
    const { uow, storage_manager } = await createUnitOfWork(options);
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

    const ctx: AppContext = {
        services,
        stores: { timer_store, job_store, toast_store },
        uow,
        logger,
        ...(storage_manager !== undefined ? { storage_manager } : {}),
    };
    return ctx;
}
