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
} from './repositories';

export interface IUnitOfWork {
    transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
    readonly jobRepo: IJobRepository;
    readonly categoryRepo: ICategoryRepository;
    readonly timeEntryRepo: ITimeEntryRepository;
    readonly historyRepo: IHistoryRepository;
    readonly externalRefRepo: IExternalRefRepository;
    readonly settingsRepo: ISettingsRepository;
    readonly templateRepo: ITemplateRepository;
    readonly jobCategoryRepo: IJobCategoryRepository;
    readonly dataFieldRepo: IDataFieldRepository;
}
