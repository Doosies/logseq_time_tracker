import type { Category } from '../../types/category';
import type { DataField } from '../../types/meta';
import type { ExternalRef } from '../../types/external_ref';
import type { JobHistory, HistoryFilter } from '../../types/history';
import type { JobCategory } from '../../types/job_category';
import type { Job } from '../../types/job';
import type { StatusKind } from '../../types/job_status';
import type { SettingsMap } from '../../types/settings';
import type { JobTemplate } from '../../types/template';
import type { TimeEntry, TimeEntryFilter } from '../../types/time_entry';

export interface IJobRepository {
    getJobs(): Promise<Job[]>;
    getJobById(id: string): Promise<Job | null>;
    getJobsByStatus(status: StatusKind): Promise<Job[]>;
    getActiveJob(): Promise<Job | null>;
    upsertJob(job: Job): Promise<void>;
    updateJobStatus(id: string, status: StatusKind, updated_at: string): Promise<void>;
    deleteJob(id: string): Promise<void>;
}

export interface ICategoryRepository {
    getCategories(): Promise<Category[]>;
    getCategoryById(id: string): Promise<Category | null>;
    upsertCategory(category: Category): Promise<void>;
    deleteCategory(id: string): Promise<void>;
}

export interface ITimeEntryRepository {
    getTimeEntries(filters?: TimeEntryFilter): Promise<TimeEntry[]>;
    getTimeEntryById(id: string): Promise<TimeEntry | null>;
    upsertTimeEntry(entry: TimeEntry): Promise<void>;
    deleteTimeEntry(id: string): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface IHistoryRepository {
    getJobHistory(job_id: string): Promise<JobHistory[]>;
    getJobHistoryByPeriod(filters: HistoryFilter): Promise<JobHistory[]>;
    appendJobHistory(history: JobHistory): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface IExternalRefRepository {
    getExternalRefs(job_id: string): Promise<ExternalRef[]>;
    getExternalRef(job_id: string, system_key: string): Promise<ExternalRef | null>;
    getExternalRefBySystemAndValue(system_key: string, ref_value: string): Promise<ExternalRef | null>;
    upsertExternalRef(ref: ExternalRef): Promise<void>;
    deleteExternalRef(id: string): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface ISettingsRepository {
    getSetting<K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K] | null>;
    setSetting<K extends keyof SettingsMap>(key: K, value: SettingsMap[K]): Promise<void>;
    deleteSetting<K extends keyof SettingsMap>(key: K): Promise<void>;
}

export interface ITemplateRepository {
    getTemplates(): Promise<JobTemplate[]>;
    getTemplateById(id: string): Promise<JobTemplate | null>;
    upsertTemplate(template: JobTemplate): Promise<void>;
    deleteTemplate(id: string): Promise<void>;
}

export interface IJobCategoryRepository {
    getJobCategories(job_id: string): Promise<JobCategory[]>;
    getCategoryJobs(category_id: string): Promise<JobCategory[]>;
    upsertJobCategory(jc: JobCategory): Promise<void>;
    deleteJobCategory(id: string): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface IDataFieldRepository {
    getDataFields(entity_type_id: string): Promise<DataField[]>;
    getDataFieldById(id: string): Promise<DataField | null>;
    upsertDataField(field: DataField): Promise<void>;
    deleteDataField(id: string): Promise<void>;
}
