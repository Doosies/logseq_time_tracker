import type { Services } from '../services';
import type { TimerStore } from '../stores/timer_store.svelte';
import type { JobStore } from '../stores/job_store.svelte';
import type { ToastStore } from '../stores/toast_store.svelte';
import type { StorageManager } from '../adapters/storage/storage_manager';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { ILogger } from '../adapters/logger';

export interface AppContext {
    services: Services;
    stores: {
        timer_store: TimerStore;
        job_store: JobStore;
        toast_store: ToastStore;
    };
    uow: IUnitOfWork;
    logger: ILogger;
    /** Set when the app was initialized with `storage_mode: 'sqlite'` (uses {@link StorageManager}, including memory fallback). */
    storage_manager?: StorageManager;
}
