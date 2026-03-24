import type { JobHistory, HistoryFilter } from '../../../types/history';
import type { IHistoryRepository } from '../repositories';

function matchesHistoryFilters(h: JobHistory, filters: HistoryFilter): boolean {
    if (filters.job_id !== undefined && h.job_id !== filters.job_id) {
        return false;
    }
    if (filters.from_date !== undefined && h.occurred_at < filters.from_date) {
        return false;
    }
    if (filters.to_date !== undefined && h.occurred_at > filters.to_date) {
        return false;
    }
    return true;
}

export class MemoryHistoryRepository implements IHistoryRepository {
    private readonly history = new Map<string, JobHistory>();

    getSnapshot(): Map<string, JobHistory> {
        const snapshot = new Map<string, JobHistory>();
        for (const [id, h] of this.history) {
            snapshot.set(id, structuredClone(h));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, JobHistory>): void {
        this.history.clear();
        for (const [id, h] of data) {
            this.history.set(id, structuredClone(h));
        }
    }

    async getJobHistory(job_id: string): Promise<JobHistory[]> {
        return Array.from(this.history.values())
            .filter((h) => h.job_id === job_id)
            .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
            .map((h) => structuredClone(h));
    }

    async getJobHistoryByPeriod(filters: HistoryFilter): Promise<JobHistory[]> {
        return Array.from(this.history.values())
            .filter((h) => matchesHistoryFilters(h, filters))
            .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
            .map((h) => structuredClone(h));
    }

    async appendJobHistory(history_item: JobHistory): Promise<void> {
        this.history.set(history_item.id, structuredClone(history_item));
    }

    async deleteByJobId(job_id: string): Promise<void> {
        for (const [id, h] of this.history) {
            if (h.job_id === job_id) {
                this.history.delete(id);
            }
        }
    }
}
