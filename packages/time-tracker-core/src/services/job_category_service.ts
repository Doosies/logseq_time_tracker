import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { JobCategory } from '../types/job_category';
import { ValidationError } from '../errors';
import { generateId } from '../utils';

export interface IJobCategoryService {
    linkJobCategory(job_id: string, category_id: string, is_default?: boolean): Promise<JobCategory>;
    unlinkJobCategory(id: string): Promise<void>;
    getJobCategories(job_id: string): Promise<JobCategory[]>;
    getCategoryJobs(category_id: string): Promise<JobCategory[]>;
    setDefaultCategory(job_id: string, category_id: string): Promise<void>;
}

export class JobCategoryService implements IJobCategoryService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _logger?: ILogger,
    ) {}

    async linkJobCategory(job_id: string, category_id: string, is_default?: boolean): Promise<JobCategory> {
        const existing_list = await this._uow.jobCategoryRepo.getJobCategories(job_id);
        const dup = existing_list.find((l) => l.category_id === category_id);
        if (dup) {
            if (is_default === true) {
                await this.setDefaultCategory(job_id, category_id);
                const refreshed = await this._uow.jobCategoryRepo.getJobCategories(job_id);
                const row = refreshed.find((l) => l.category_id === category_id);
                if (!row) {
                    throw new ValidationError('Job-category link not found after set default', 'category_id');
                }
                return row;
            }
            return dup;
        }

        return this._uow.transaction(async (uow) => {
            await this.assertJobAndCategory(uow, job_id, category_id);
            const links = await uow.jobCategoryRepo.getJobCategories(job_id);
            const race_dup = links.find((l) => l.category_id === category_id);
            if (race_dup) {
                if (is_default === true) {
                    await this.applySetDefaultCategory(uow, job_id, category_id);
                }
                const refreshed = await uow.jobCategoryRepo.getJobCategories(job_id);
                return refreshed.find((l) => l.category_id === category_id)!;
            }
            const jc: JobCategory = {
                id: generateId(),
                job_id,
                category_id,
                is_default: false,
                created_at: new Date().toISOString(),
            };
            await uow.jobCategoryRepo.upsertJobCategory(jc);
            if (is_default === true) {
                await this.applySetDefaultCategory(uow, job_id, category_id);
            }
            const refreshed = await uow.jobCategoryRepo.getJobCategories(job_id);
            const row = refreshed.find((l) => l.category_id === category_id)!;
            this._logger?.debug('Job-category linked', { id: row.id, job_id, category_id });
            return row;
        });
    }

    async unlinkJobCategory(id: string): Promise<void> {
        await this._uow.jobCategoryRepo.deleteJobCategory(id);
        this._logger?.debug('Job-category unlinked', { id });
    }

    async getJobCategories(job_id: string): Promise<JobCategory[]> {
        return this._uow.jobCategoryRepo.getJobCategories(job_id);
    }

    async getCategoryJobs(category_id: string): Promise<JobCategory[]> {
        return this._uow.jobCategoryRepo.getCategoryJobs(category_id);
    }

    async setDefaultCategory(job_id: string, category_id: string): Promise<void> {
        await this._uow.transaction(async (uow) => {
            await this.assertJobAndCategory(uow, job_id, category_id);
            await this.applySetDefaultCategory(uow, job_id, category_id);
        });
        this._logger?.debug('Default job-category set', { job_id, category_id });
    }

    private async assertJobAndCategory(uow: IUnitOfWork, job_id: string, category_id: string): Promise<void> {
        const job = await uow.jobRepo.getJobById(job_id);
        if (!job) {
            throw new ValidationError(`Job not found: ${job_id}`, 'job_id');
        }
        const category = await uow.categoryRepo.getCategoryById(category_id);
        if (!category) {
            throw new ValidationError(`Category not found: ${category_id}`, 'category_id');
        }
    }

    private async applySetDefaultCategory(uow: IUnitOfWork, job_id: string, category_id: string): Promise<void> {
        let links = await uow.jobCategoryRepo.getJobCategories(job_id);
        if (!links.some((l) => l.category_id === category_id)) {
            const jc: JobCategory = {
                id: generateId(),
                job_id,
                category_id,
                is_default: false,
                created_at: new Date().toISOString(),
            };
            await uow.jobCategoryRepo.upsertJobCategory(jc);
            links = await uow.jobCategoryRepo.getJobCategories(job_id);
        }
        for (const link of links) {
            await uow.jobCategoryRepo.upsertJobCategory({
                ...link,
                is_default: link.category_id === category_id,
            });
        }
    }
}
