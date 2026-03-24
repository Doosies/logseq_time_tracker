import type { Services } from '../services';
import type { TimerStore } from '../stores/timer_store.svelte';
import type { JobStore } from '../stores/job_store.svelte';
import type { ToastStore } from '../stores/toast_store.svelte';
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
}
