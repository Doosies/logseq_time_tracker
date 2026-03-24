import type { Database } from 'sql.js';
import { StorageError } from '../../../errors';
import type { Job } from '../../../types/job';
import type { StatusKind } from '../../../types/job_status';
import type { IJobRepository } from '../repositories';
import { execToRecords, mapRowToJob } from './row_mapper';

export class SqliteJobRepository implements IJobRepository {
    constructor(private readonly db: Database) {}

    async getJobs(): Promise<Job[]> {
        const rows = execToRecords(this.db, `SELECT * FROM job ORDER BY created_at DESC`);
        return rows.map(mapRowToJob);
    }

    async getJobById(id: string): Promise<Job | null> {
        const rows = execToRecords(this.db, `SELECT * FROM job WHERE id = ?`, [id]);
        const row = rows[0];
        return row === undefined ? null : mapRowToJob(row);
    }

    async getJobsByStatus(status: StatusKind): Promise<Job[]> {
        const rows = execToRecords(this.db, `SELECT * FROM job WHERE status = ? ORDER BY created_at DESC`, [status]);
        return rows.map(mapRowToJob);
    }

    async getActiveJob(): Promise<Job | null> {
        const rows = execToRecords(this.db, `SELECT * FROM job WHERE status = ?`, ['in_progress']);
        if (rows.length > 1) {
            console.warn('[SqliteJobRepository] Multiple jobs in_progress; returning the first match.');
        }
        const row = rows[0];
        return row === undefined ? null : mapRowToJob(row);
    }

    async upsertJob(job: Job): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO job (id, title, description, status, custom_fields, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [job.id, job.title, job.description, job.status, job.custom_fields, job.created_at, job.updated_at],
        );
    }

    async updateJobStatus(id: string, status: StatusKind, updated_at: string): Promise<void> {
        this.db.run(`UPDATE job SET status = ?, updated_at = ? WHERE id = ?`, [status, updated_at, id]);
        if (this.db.getRowsModified() === 0) {
            throw new StorageError(`Job not found: ${id}`, 'updateJobStatus');
        }
    }

    async deleteJob(id: string): Promise<void> {
        this.db.run(`DELETE FROM job WHERE id = ?`, [id]);
    }
}
