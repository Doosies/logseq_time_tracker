import type { Category } from '../../../types/category';
import type { JobHistory } from '../../../types/history';
import type { JobCategory } from '../../../types/job_category';
import type { Job } from '../../../types/job';
import type { TimeEntry } from '../../../types/time_entry';
import type { IUnitOfWork } from '../unit_of_work';
import type {
    ICategoryRepository,
    IDataFieldRepository,
    IExternalRefRepository,
    IHistoryRepository,
    IJobCategoryRepository,
    IJobRepository,
    ISettingsRepository,
    ITemplateRepository,
    ITimeEntryRepository,
} from '../repositories';
import { MemoryCategoryRepository } from './memory_category_repository';
import { MemoryHistoryRepository } from './memory_history_repository';
import { MemoryJobCategoryRepository } from './memory_job_category_repository';
import { MemoryJobRepository } from './memory_job_repository';
import { MemorySettingsRepository } from './memory_settings_repository';
import { MemoryTimeEntryRepository } from './memory_time_entry_repository';
import { StubDataFieldRepository, StubExternalRefRepository, StubTemplateRepository } from './stubs';

type MemoryDataSnapshot = {
    jobs: Map<string, Job>;
    categories: Map<string, Category>;
    time_entries: Map<string, TimeEntry>;
    history: Map<string, JobHistory>;
    job_categories: Map<string, JobCategory>;
    settings: Map<string, unknown>;
};

export class MemoryUnitOfWork implements IUnitOfWork {
    readonly jobRepo: IJobRepository;
    readonly categoryRepo: ICategoryRepository;
    readonly timeEntryRepo: ITimeEntryRepository;
    readonly historyRepo: IHistoryRepository;
    readonly externalRefRepo: IExternalRefRepository;
    readonly settingsRepo: ISettingsRepository;
    readonly templateRepo: ITemplateRepository;
    readonly jobCategoryRepo: IJobCategoryRepository;
    readonly dataFieldRepo: IDataFieldRepository;

    private readonly _job_repo: MemoryJobRepository;
    private readonly _category_repo: MemoryCategoryRepository;
    private readonly _time_entry_repo: MemoryTimeEntryRepository;
    private readonly _history_repo: MemoryHistoryRepository;
    private readonly _job_category_repo: MemoryJobCategoryRepository;
    private readonly _settings_repo: MemorySettingsRepository;

    private _active_transaction = false;

    constructor() {
        this._job_repo = new MemoryJobRepository();
        this._category_repo = new MemoryCategoryRepository();
        this._time_entry_repo = new MemoryTimeEntryRepository();
        this._history_repo = new MemoryHistoryRepository();
        this._job_category_repo = new MemoryJobCategoryRepository();
        this._settings_repo = new MemorySettingsRepository();

        this.jobRepo = this._job_repo;
        this.categoryRepo = this._category_repo;
        this.timeEntryRepo = this._time_entry_repo;
        this.historyRepo = this._history_repo;
        this.settingsRepo = this._settings_repo;
        this.externalRefRepo = new StubExternalRefRepository();
        this.templateRepo = new StubTemplateRepository();
        this.jobCategoryRepo = this._job_category_repo;
        this.dataFieldRepo = new StubDataFieldRepository();
    }

    async transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
        if (this._active_transaction) {
            return fn(this);
        }
        this._active_transaction = true;
        const snapshot = this.createSnapshot();
        try {
            return await fn(this);
        } catch (e) {
            this.restoreSnapshot(snapshot);
            throw e;
        } finally {
            this._active_transaction = false;
        }
    }

    private createSnapshot(): MemoryDataSnapshot {
        return {
            jobs: this._job_repo.getSnapshot(),
            categories: this._category_repo.getSnapshot(),
            time_entries: this._time_entry_repo.getSnapshot(),
            history: this._history_repo.getSnapshot(),
            job_categories: this._job_category_repo.getSnapshot(),
            settings: this._settings_repo.getSnapshot(),
        };
    }

    private restoreSnapshot(snapshot: MemoryDataSnapshot): void {
        this._job_repo.restoreFromSnapshot(snapshot.jobs);
        this._category_repo.restoreFromSnapshot(snapshot.categories);
        this._time_entry_repo.restoreFromSnapshot(snapshot.time_entries);
        this._history_repo.restoreFromSnapshot(snapshot.history);
        this._job_category_repo.restoreFromSnapshot(snapshot.job_categories);
        this._settings_repo.restoreFromSnapshot(snapshot.settings);
    }
}
