import type { ILogger } from '../logger';
import type { Category } from '../../types/category';
import type { JobHistory } from '../../types/history';
import type { SettingsMap, StorageState } from '../../types/settings';
import { MemoryUnitOfWork } from './memory/memory_unit_of_work';
import { ALL_MIGRATIONS } from './sqlite/migrations';
import { MigrationRunner } from './sqlite/migration_runner';
import { SqliteAdapter, type SqliteAdapterOptions } from './sqlite/sqlite_adapter';
import type { IStorageBackend } from './sqlite/storage_backend';
import { SqliteUnitOfWork } from './sqlite/sqlite_unit_of_work';
import type { IUnitOfWork } from './unit_of_work';
import { runWithExponentialBackoff, type ExponentialBackoffOptions } from './exponential_backoff';
import { StorageStateMachine, type StorageStateListener } from './storage_state';
import type { WebLocksManager } from './web_locks';

const DEFAULT_RETRY: ExponentialBackoffOptions = {
    max_attempts: 3,
    base_delay_ms: 50,
};

const SETTINGS_KEYS: (keyof SettingsMap)[] = ['active_timer', 'last_selected_category'];

export interface StorageManagerOptions {
    sqlite_options: SqliteAdapterOptions;
    backend: IStorageBackend;
    logger?: ILogger;
    /** When set, {@link initialize} acquires before SQLite init and {@link dispose} releases. */
    web_locks?: WebLocksManager;
    /** Retry policy for SQLite init / recover; override `sleep` in tests. */
    retry_options?: ExponentialBackoffOptions;
}

async function collectMemoryPayload(mem: MemoryUnitOfWork): Promise<{
    categories: Category[];
    jobs: Awaited<ReturnType<MemoryUnitOfWork['jobRepo']['getJobs']>>;
    time_entries: Awaited<ReturnType<MemoryUnitOfWork['timeEntryRepo']['getTimeEntries']>>;
    history: JobHistory[];
    settings: Array<{ key: keyof SettingsMap; value: SettingsMap[keyof SettingsMap] }>;
}> {
    const categories = await mem.categoryRepo.getCategories();
    const jobs = await mem.jobRepo.getJobs();
    const time_entries = await mem.timeEntryRepo.getTimeEntries();
    const history: JobHistory[] = [];
    for (const job of jobs) {
        history.push(...(await mem.historyRepo.getJobHistory(job.id)));
    }
    const settings: Array<{ key: keyof SettingsMap; value: SettingsMap[keyof SettingsMap] }> = [];
    for (const key of SETTINGS_KEYS) {
        const value = await mem.settingsRepo.getSetting(key);
        if (value !== null) {
            settings.push({ key, value });
        }
    }
    return { categories, jobs, time_entries, history, settings };
}

function sortCategoriesForFk(categories: Category[]): Category[] {
    const copy = [...categories];
    copy.sort((a, b) => {
        if (a.parent_id === null && b.parent_id !== null) {
            return -1;
        }
        if (a.parent_id !== null && b.parent_id === null) {
            return 1;
        }
        return a.sort_order - b.sort_order;
    });
    return copy;
}

/**
 * Coordinates SQLite initialization, memory fallback, and optional recovery back to SQLite.
 */
export class StorageManager {
    private readonly _state_machine = new StorageStateMachine('sqlite');
    private readonly _options: StorageManagerOptions;
    private readonly _retry: ExponentialBackoffOptions;

    private _sqlite_adapter: SqliteAdapter | null = null;
    private _active_uow!: IUnitOfWork;
    private _memory_uow: MemoryUnitOfWork | null = null;
    private _lock_acquired = false;

    constructor(options: StorageManagerOptions) {
        this._options = options;
        this._retry = { ...DEFAULT_RETRY, ...options.retry_options };
    }

    async initialize(): Promise<IUnitOfWork> {
        const logger = this._options.logger;
        const locks = this._options.web_locks;

        if (locks !== undefined) {
            this._lock_acquired = await locks.acquireLock();
            if (!this._lock_acquired) {
                logger?.warn('Web Lock not acquired; continuing without exclusive lock');
            }
        }

        try {
            const uow = await this._tryInitSqliteUow();
            this._active_uow = uow;
            return uow;
        } catch (first_error) {
            const reason =
                first_error instanceof Error ? first_error.message : `SQLite init failed: ${String(first_error)}`;
            logger?.warn('SQLite unavailable; using memory fallback', { reason });
            const mem = new MemoryUnitOfWork();
            this._memory_uow = mem;
            this._active_uow = mem;
            this._state_machine.transitionToFallback(reason);
            return mem;
        }
    }

    getUnitOfWork(): IUnitOfWork {
        return this._active_uow;
    }

    getStorageState(): StorageState {
        return this._state_machine.getState();
    }

    subscribe(listener: StorageStateListener): () => void {
        return this._state_machine.subscribe(listener);
    }

    /**
     * Attempts to reopen SQLite and merge in-memory data in one transaction.
     */
    async tryRecover(): Promise<boolean> {
        const logger = this._options.logger;
        if (this._state_machine.getState().mode !== 'memory_fallback' || this._memory_uow === null) {
            return false;
        }

        const mem = this._memory_uow;
        let adapter: SqliteAdapter | null = null;

        try {
            adapter = await this._createAndInitSqliteAdapter();
        } catch (e) {
            logger?.warn('tryRecover: SQLite re-init failed', { error: String(e) });
            return false;
        }

        const sqlite_uow = new SqliteUnitOfWork(adapter);

        try {
            const payload = await collectMemoryPayload(mem);
            const categories_ordered = sortCategoriesForFk(payload.categories);

            await sqlite_uow.transaction(async (u) => {
                for (const c of categories_ordered) {
                    await u.categoryRepo.upsertCategory(c);
                }
                for (const j of payload.jobs) {
                    await u.jobRepo.upsertJob(j);
                }
                for (const e of payload.time_entries) {
                    await u.timeEntryRepo.upsertTimeEntry(e);
                }
                for (const h of payload.history) {
                    await u.historyRepo.appendJobHistory(h);
                }
                for (const { key, value } of payload.settings) {
                    await u.settingsRepo.setSetting(key, value);
                }
            });

            this._sqlite_adapter = adapter;
            this._active_uow = sqlite_uow;
            this._memory_uow = null;
            this._state_machine.transitionToSqlite();
            logger?.info('Storage recovered from memory fallback to SQLite');
            return true;
        } catch (e) {
            logger?.warn('tryRecover: merge transaction failed', { error: String(e) });
            await adapter.close();
            return false;
        }
    }

    dispose(): void {
        if (this._options.web_locks !== undefined && this._lock_acquired) {
            this._options.web_locks.releaseLock();
            this._lock_acquired = false;
        }
        void this._sqlite_adapter?.close();
        this._sqlite_adapter = null;
        this._memory_uow = null;
        this._state_machine.clearListeners();
    }

    private async _tryInitSqliteUow(): Promise<SqliteUnitOfWork> {
        const adapter = await this._createAndInitSqliteAdapter();
        this._sqlite_adapter = adapter;
        const uow = new SqliteUnitOfWork(adapter);
        this._memory_uow = null;
        return uow;
    }

    private async _createAndInitSqliteAdapter(): Promise<SqliteAdapter> {
        const backend = this._options.backend;
        const opts = this._options.sqlite_options;
        return runWithExponentialBackoff(this._retry, async () => {
            const adapter = new SqliteAdapter(backend);
            await adapter.initialize(opts);
            const runner = new MigrationRunner(adapter.getDatabase(), ALL_MIGRATIONS);
            runner.run();
            return adapter;
        });
    }
}
