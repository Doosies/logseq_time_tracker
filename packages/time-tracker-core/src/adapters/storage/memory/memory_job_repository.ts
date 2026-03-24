import { StorageError } from '../../../errors';
import type { Job } from '../../../types/job';
import type { StatusKind } from '../../../types/job_status';
import type { IJobRepository } from '../repositories';

export class MemoryJobRepository implements IJobRepository {
    private readonly jobs = new Map<string, Job>();

    getSnapshot(): Map<string, Job> {
        const snapshot = new Map<string, Job>();
        for (const [id, job] of this.jobs) {
            snapshot.set(id, structuredClone(job));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, Job>): void {
        this.jobs.clear();
        for (const [id, job] of data) {
            this.jobs.set(id, structuredClone(job));
        }
    }

    async getJobs(): Promise<Job[]> {
        return Array.from(this.jobs.values(), (j) => structuredClone(j));
    }

    async getJobById(id: string): Promise<Job | null> {
        const j = this.jobs.get(id);
        return j ? structuredClone(j) : null;
    }

    async getJobsByStatus(status: StatusKind): Promise<Job[]> {
        return Array.from(this.jobs.values())
            .filter((j) => j.status === status)
            .map((j) => structuredClone(j));
    }

    async getActiveJob(): Promise<Job | null> {
        const in_progress = Array.from(this.jobs.values()).filter((j) => j.status === 'in_progress');
        if (in_progress.length > 1) {
            console.warn('[MemoryJobRepository] Multiple jobs in_progress; returning the first match.');
        }
        const first = in_progress[0];
        return first ? structuredClone(first) : null;
    }

    async upsertJob(job: Job): Promise<void> {
        this.jobs.set(job.id, structuredClone(job));
    }

    async updateJobStatus(id: string, status: StatusKind, updated_at: string): Promise<void> {
        const existing = this.jobs.get(id);
        if (!existing) {
            throw new StorageError(`Job not found: ${id}`, 'updateJobStatus');
        }
        this.jobs.set(id, structuredClone({ ...existing, status, updated_at }));
    }

    async deleteJob(id: string): Promise<void> {
        this.jobs.delete(id);
    }
}
