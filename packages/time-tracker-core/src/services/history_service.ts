import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { JobHistory, HistoryFilter, StatusKind } from '../types';
import { generateId } from '../utils';

export interface IHistoryService {
    recordTransition(job_id: string, from: StatusKind | null, to: StatusKind, reason: string): Promise<void>;
    getJobHistory(job_id: string): Promise<JobHistory[]>;
    getHistoryByPeriod(filter: HistoryFilter): Promise<JobHistory[]>;
}

export class HistoryService implements IHistoryService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _logger?: ILogger,
    ) {}

    async recordTransition(job_id: string, from: StatusKind | null, to: StatusKind, reason: string): Promise<void> {
        const now = new Date().toISOString();
        const history: JobHistory = {
            id: generateId(),
            job_id,
            from_status: from,
            to_status: to,
            reason,
            occurred_at: now,
            created_at: now,
        };
        await this._uow.transaction(async (uow) => {
            await uow.historyRepo.appendJobHistory(history);
        });
        this._logger?.debug('Recorded transition', { job_id, from, to });
    }

    async getJobHistory(job_id: string): Promise<JobHistory[]> {
        return this._uow.historyRepo.getJobHistory(job_id);
    }

    async getHistoryByPeriod(filter: HistoryFilter): Promise<JobHistory[]> {
        return this._uow.historyRepo.getJobHistoryByPeriod(filter);
    }
}
