import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { Category } from '../types/category';
import type { ExportData, ImportResult } from '../types/export';
import { validateExportData } from '../types/export_schema';
import type { JobCategory } from '../types/job_category';
import type { SettingsMap } from '../types/settings';
import { StorageError, ValidationError } from '../errors';

const CURRENT_EXPORT_VERSION = '0.2.0';

type ExportMigrationFn = (data: ExportData) => ExportData;

const EXPORT_MIGRATIONS: Record<string, ExportMigrationFn> = {
    '0.1.0': (data) => ({
        ...data,
        version: '0.2.0',
        data: {
            ...data.data,
            job_categories: [],
            job_templates: [],
            external_refs: [],
        },
    }),
};

function migrateExportData(data: ExportData): ExportData {
    let current: ExportData = structuredClone(data);
    while (current.version !== CURRENT_EXPORT_VERSION) {
        const fn = EXPORT_MIGRATIONS[current.version];
        if (!fn) {
            throw new ValidationError(`Unsupported export version: ${current.version}`, 'version');
        }
        current = fn(current);
    }
    return current;
}

function categoryDepth(c: Category, by_id: Map<string, Category>): number {
    let depth = 0;
    let parent_id: string | null = c.parent_id;
    const visited = new Set<string>();
    while (parent_id !== null && by_id.has(parent_id) && !visited.has(parent_id)) {
        visited.add(parent_id);
        depth += 1;
        parent_id = by_id.get(parent_id)!.parent_id;
    }
    return depth;
}

function sortCategoriesForInsert(categories: Category[]): Category[] {
    const by_id = new Map(categories.map((c) => [c.id, c]));
    return [...categories].sort((a, b) => categoryDepth(a, by_id) - categoryDepth(b, by_id));
}

function sortCategoriesForDelete(categories: Category[]): Category[] {
    const by_id = new Map(categories.map((c) => [c.id, c]));
    return [...categories].sort((a, b) => categoryDepth(b, by_id) - categoryDepth(a, by_id));
}

type ImportEntityCounts = {
    categories: number;
    jobs: number;
    time_entries: number;
    job_history: number;
    external_refs: number;
    job_categories: number;
    job_templates: number;
    settings: number;
};

export class DataExportService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _logger?: ILogger,
    ) {}

    async exportAll(): Promise<ExportData> {
        const jobs = await this._uow.jobRepo.getJobs();
        const categories = await this._uow.categoryRepo.getCategories();
        const time_entries = await this._uow.timeEntryRepo.getTimeEntries();
        const job_history = await this._uow.historyRepo.getJobHistoryByPeriod({});

        const job_categories: JobCategory[] = [];
        for (const job of jobs) {
            try {
                const rows = await this._uow.jobCategoryRepo.getJobCategories(job.id);
                job_categories.push(...rows);
            } catch (e) {
                if (!(e instanceof StorageError)) {
                    throw e;
                }
            }
        }

        const job_templates = await this.safeGetTemplates();
        const external_refs = await this.safeCollectExternalRefs(jobs);

        const settings: Record<string, unknown> = {};
        const active_timer = await this._uow.settingsRepo.getSetting('active_timer');
        if (active_timer !== null) {
            settings['active_timer'] = active_timer;
        }
        const last_selected = await this._uow.settingsRepo.getSetting('last_selected_category');
        if (last_selected !== null) {
            settings['last_selected_category'] = last_selected;
        }

        const exported_at = new Date().toISOString();
        this._logger?.info('Export completed', {
            version: CURRENT_EXPORT_VERSION,
            jobs: jobs.length,
            categories: categories.length,
        });

        return {
            version: CURRENT_EXPORT_VERSION,
            exported_at,
            data: {
                jobs,
                categories,
                time_entries,
                job_history,
                job_categories,
                job_templates,
                external_refs,
                settings,
            },
        };
    }

    async importAll(data: ExportData): Promise<ImportResult> {
        try {
            const validated = validateExportData(data);
            const migrated = migrateExportData(validated);
            const payload = migrated.data;
            const imported_counts = await this._uow.transaction(async (uow) => {
                await this.clearAllData(uow);
                return await this.importPayload(uow, payload);
            });
            return { success: true, imported_counts, errors: [] };
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            this._logger?.error('Import failed', { error: msg });
            return { success: false, imported_counts: {}, errors: [msg] };
        }
    }

    private async safeGetTemplates() {
        try {
            return await this._uow.templateRepo.getTemplates();
        } catch (e) {
            if (e instanceof StorageError) {
                return [];
            }
            throw e;
        }
    }

    private async safeCollectExternalRefs(jobs: { id: string }[]) {
        const external_refs = [];
        for (const job of jobs) {
            try {
                const refs = await this._uow.externalRefRepo.getExternalRefs(job.id);
                external_refs.push(...refs);
            } catch (e) {
                if (e instanceof StorageError) {
                    return [];
                }
                throw e;
            }
        }
        return external_refs;
    }

    private async clearAllData(uow: IUnitOfWork): Promise<void> {
        const jobs = await uow.jobRepo.getJobs();
        for (const job of jobs) {
            await uow.timeEntryRepo.deleteByJobId(job.id);
            await uow.historyRepo.deleteByJobId(job.id);
            try {
                await uow.externalRefRepo.deleteByJobId(job.id);
            } catch (e) {
                if (!(e instanceof StorageError)) {
                    throw e;
                }
            }
            await uow.jobCategoryRepo.deleteByJobId(job.id);
        }
        for (const job of jobs) {
            await uow.jobRepo.deleteJob(job.id);
        }

        try {
            const templates = await uow.templateRepo.getTemplates();
            for (const t of templates) {
                await uow.templateRepo.deleteTemplate(t.id);
            }
        } catch (e) {
            if (!(e instanceof StorageError)) {
                throw e;
            }
        }

        const categories = await uow.categoryRepo.getCategories();
        for (const c of sortCategoriesForDelete(categories)) {
            await uow.categoryRepo.deleteCategory(c.id);
        }

        await uow.settingsRepo.deleteSetting('active_timer');
        await uow.settingsRepo.deleteSetting('last_selected_category');
    }

    private async importPayload(uow: IUnitOfWork, payload: ExportData['data']): Promise<Record<string, number>> {
        const counts: ImportEntityCounts = {
            categories: 0,
            jobs: 0,
            time_entries: 0,
            job_history: 0,
            external_refs: 0,
            job_categories: 0,
            job_templates: 0,
            settings: 0,
        };

        const categories = payload.categories ?? [];
        for (const c of sortCategoriesForInsert(categories)) {
            await uow.categoryRepo.upsertCategory(c);
            counts.categories += 1;
        }

        for (const job of payload.jobs ?? []) {
            await uow.jobRepo.upsertJob(job);
            counts.jobs += 1;
        }

        for (const entry of payload.time_entries ?? []) {
            await uow.timeEntryRepo.upsertTimeEntry(entry);
            counts.time_entries += 1;
        }

        for (const h of payload.job_history ?? []) {
            await uow.historyRepo.appendJobHistory(h);
            counts.job_history += 1;
        }

        for (const ref of payload.external_refs ?? []) {
            await uow.externalRefRepo.upsertExternalRef(ref);
            counts.external_refs += 1;
        }

        for (const jc of payload.job_categories ?? []) {
            await uow.jobCategoryRepo.upsertJobCategory(jc);
            counts.job_categories += 1;
        }

        for (const t of payload.job_templates ?? []) {
            await uow.templateRepo.upsertTemplate(t);
            counts.job_templates += 1;
        }

        const settings_obj = payload.settings ?? {};
        for (const key of Object.keys(settings_obj)) {
            if (key === 'active_timer') {
                await uow.settingsRepo.setSetting('active_timer', settings_obj[key] as SettingsMap['active_timer']);
                counts.settings += 1;
            } else if (key === 'last_selected_category') {
                await uow.settingsRepo.setSetting('last_selected_category', String(settings_obj[key]));
                counts.settings += 1;
            }
        }

        return counts satisfies Record<string, number>;
    }
}
