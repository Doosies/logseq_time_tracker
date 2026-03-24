import type { JobCategory } from '../../../types/job_category';
import type { IJobCategoryRepository } from '../repositories';

export class MemoryJobCategoryRepository implements IJobCategoryRepository {
    private readonly _rows = new Map<string, JobCategory>();

    getSnapshot(): Map<string, JobCategory> {
        const snapshot = new Map<string, JobCategory>();
        for (const [id, row] of this._rows) {
            snapshot.set(id, structuredClone(row));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, JobCategory>): void {
        this._rows.clear();
        for (const [id, row] of data) {
            this._rows.set(id, structuredClone(row));
        }
    }

    async getJobCategories(job_id: string): Promise<JobCategory[]> {
        return Array.from(this._rows.values(), (row) => structuredClone(row))
            .filter((row) => row.job_id === job_id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at));
    }

    async getCategoryJobs(category_id: string): Promise<JobCategory[]> {
        return Array.from(this._rows.values(), (row) => structuredClone(row))
            .filter((row) => row.category_id === category_id)
            .sort((a, b) => a.created_at.localeCompare(b.created_at));
    }

    async upsertJobCategory(jc: JobCategory): Promise<void> {
        this._rows.set(jc.id, structuredClone(jc));
    }

    async deleteJobCategory(id: string): Promise<void> {
        this._rows.delete(id);
    }

    async deleteByJobId(job_id: string): Promise<void> {
        for (const [id, row] of this._rows) {
            if (row.job_id === job_id) {
                this._rows.delete(id);
            }
        }
    }
}
