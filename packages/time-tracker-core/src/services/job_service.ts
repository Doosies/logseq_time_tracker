import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { IHistoryService } from './history_service';
import type { Job, StatusKind } from '../types';
import { isValidTransition } from '../types/job_status';
import { ValidationError, StateTransitionError, StorageError } from '../errors';
import { sanitizeText, generateId } from '../utils';
import { MAX_TITLE_LENGTH, MAX_DESCRIPTION_LENGTH, MAX_REASON_LENGTH } from '../constants/config';

export interface IJobService {
    createJob(params: { title: string; description?: string }): Promise<Job>;
    getJobs(filter?: { status?: StatusKind }): Promise<Job[]>;
    getJobById(id: string): Promise<Job | null>;
    updateJob(id: string, updates: Partial<Pick<Job, 'title' | 'description'>>): Promise<Job>;
    deleteJob(id: string): Promise<void>;
    transitionStatus(job_id: string, to_status: StatusKind, reason: string): Promise<void>;
    switchJob(from_job_id: string, to_job_id: string, reason: string): Promise<void>;
}

export class JobService implements IJobService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _history_service: IHistoryService,
        private readonly _logger?: ILogger,
    ) {}

    async createJob(params: { title: string; description?: string }): Promise<Job> {
        const title = sanitizeText(params.title, MAX_TITLE_LENGTH);
        if (title.length === 0) {
            throw new ValidationError('Title cannot be empty', 'title');
        }
        const description =
            params.description !== undefined ? sanitizeText(params.description, MAX_DESCRIPTION_LENGTH) : '';
        const now = new Date().toISOString();
        const job: Job = {
            id: generateId(),
            title,
            description,
            status: 'pending',
            custom_fields: '{}',
            created_at: now,
            updated_at: now,
        };
        return this._uow.transaction(async (uow) => {
            await uow.jobRepo.upsertJob(job);
            this._logger?.debug('Job created', { id: job.id });
            return job;
        });
    }

    async getJobs(filter?: { status?: StatusKind }): Promise<Job[]> {
        if (filter?.status !== undefined) {
            return this._uow.jobRepo.getJobsByStatus(filter.status);
        }
        return this._uow.jobRepo.getJobs();
    }

    async getJobById(id: string): Promise<Job | null> {
        return this._uow.jobRepo.getJobById(id);
    }

    async updateJob(id: string, updates: Partial<Pick<Job, 'title' | 'description'>>): Promise<Job> {
        const existing = await this._uow.jobRepo.getJobById(id);
        if (!existing) {
            throw new ValidationError(`Job not found: ${id}`, 'id');
        }
        const now = new Date().toISOString();
        let title = existing.title;
        let description = existing.description;
        if (updates.title !== undefined) {
            title = sanitizeText(updates.title, MAX_TITLE_LENGTH);
            if (title.length === 0) {
                throw new ValidationError('Title cannot be empty', 'title');
            }
        }
        if (updates.description !== undefined) {
            description = sanitizeText(updates.description, MAX_DESCRIPTION_LENGTH);
        }
        const job: Job = {
            ...existing,
            title,
            description,
            updated_at: now,
        };
        return this._uow.transaction(async (uow) => {
            await uow.jobRepo.upsertJob(job);
            return job;
        });
    }

    async deleteJob(id: string): Promise<void> {
        const job = await this._uow.jobRepo.getJobById(id);
        if (!job) {
            throw new ValidationError(`Job not found: ${id}`, 'id');
        }
        if (job.status === 'in_progress' || job.status === 'paused') {
            throw new StateTransitionError(job.status, job.status, 'Cannot delete a job that is in progress or paused');
        }
        await this._uow.transaction(async (uow) => {
            await uow.timeEntryRepo.deleteByJobId(id);
            await uow.historyRepo.deleteByJobId(id);
            try {
                await uow.externalRefRepo.deleteByJobId(id);
            } catch (e) {
                if (!(e instanceof StorageError)) {
                    throw e;
                }
            }
            try {
                await uow.jobCategoryRepo.deleteByJobId(id);
            } catch (e) {
                if (!(e instanceof StorageError)) {
                    throw e;
                }
            }
            await uow.jobRepo.deleteJob(id);
        });
        this._logger?.debug('Job deleted', { id });
    }

    async transitionStatus(job_id: string, to_status: StatusKind, reason: string): Promise<void> {
        const reason_sanitized = sanitizeText(reason, MAX_REASON_LENGTH);
        const job = await this._uow.jobRepo.getJobById(job_id);
        if (!job) {
            throw new ValidationError(`Job not found: ${job_id}`, 'job_id');
        }
        if (!isValidTransition(job.status, to_status)) {
            throw new StateTransitionError(job.status, to_status);
        }
        const now = new Date().toISOString();
        await this._uow.transaction(async (uow) => {
            await this._history_service.recordTransition(job_id, job.status, to_status, reason_sanitized);
            await uow.jobRepo.updateJobStatus(job_id, to_status, now);
        });
    }

    async switchJob(from_job_id: string, to_job_id: string, reason: string): Promise<void> {
        const reason_sanitized = sanitizeText(reason, MAX_REASON_LENGTH);
        await this._uow.transaction(async () => {
            const from_job = await this._uow.jobRepo.getJobById(from_job_id);
            if (!from_job) {
                throw new ValidationError(`Job not found: ${from_job_id}`, 'from_job_id');
            }
            if (from_job.status === 'in_progress') {
                await this.transitionStatus(from_job_id, 'paused', reason_sanitized);
            } else if (from_job.status !== 'paused') {
                throw new StateTransitionError(from_job.status, 'paused');
            }
            await this.transitionStatus(to_job_id, 'in_progress', reason_sanitized);
        });
    }
}
