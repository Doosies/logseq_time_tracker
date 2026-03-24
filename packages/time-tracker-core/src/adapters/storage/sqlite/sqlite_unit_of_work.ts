import type { IUnitOfWork } from '../unit_of_work';
import type { SqliteAdapter } from './sqlite_adapter';
import { SqliteCategoryRepository } from './sqlite_category_repository';
import { SqliteDataFieldRepository } from './sqlite_data_field_repository';
import { SqliteExternalRefRepository } from './sqlite_external_ref_repository';
import { SqliteHistoryRepository } from './sqlite_history_repository';
import { SqliteJobCategoryRepository } from './sqlite_job_category_repository';
import { SqliteJobRepository } from './sqlite_job_repository';
import { SqliteSettingsRepository } from './sqlite_settings_repository';
import { SqliteTemplateRepository } from './sqlite_template_repository';
import { SqliteTimeEntryRepository } from './sqlite_time_entry_repository';

/**
 * sql.js SQLite-backed {@link IUnitOfWork} with real BEGIN/COMMIT/ROLLBACK.
 * Nested {@link SqliteUnitOfWork#transaction} calls join the outer transaction (no nested BEGIN).
 */
export class SqliteUnitOfWork implements IUnitOfWork {
    private _active_transaction = false;

    readonly jobRepo: SqliteJobRepository;
    readonly categoryRepo: SqliteCategoryRepository;
    readonly timeEntryRepo: SqliteTimeEntryRepository;
    readonly historyRepo: SqliteHistoryRepository;
    readonly externalRefRepo: SqliteExternalRefRepository;
    readonly settingsRepo: SqliteSettingsRepository;
    readonly templateRepo: SqliteTemplateRepository;
    readonly jobCategoryRepo: SqliteJobCategoryRepository;
    readonly dataFieldRepo: SqliteDataFieldRepository;

    constructor(private readonly _adapter: SqliteAdapter) {
        const db = this._adapter.getDatabase();
        this.jobRepo = new SqliteJobRepository(db);
        this.categoryRepo = new SqliteCategoryRepository(db);
        this.timeEntryRepo = new SqliteTimeEntryRepository(db);
        this.historyRepo = new SqliteHistoryRepository(db);
        this.externalRefRepo = new SqliteExternalRefRepository(db);
        this.settingsRepo = new SqliteSettingsRepository(db);
        this.templateRepo = new SqliteTemplateRepository(db);
        this.jobCategoryRepo = new SqliteJobCategoryRepository(db);
        this.dataFieldRepo = new SqliteDataFieldRepository(db);
    }

    async transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
        if (this._active_transaction) {
            return fn(this);
        }

        const db = this._adapter.getDatabase();
        this._active_transaction = true;
        db.run('BEGIN TRANSACTION');
        try {
            const result = await fn(this);
            db.run('COMMIT');
            await this._adapter.persist();
            return result;
        } catch (e) {
            db.run('ROLLBACK');
            throw e;
        } finally {
            this._active_transaction = false;
        }
    }
}
