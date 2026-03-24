import type { Database } from 'sql.js';
import type { JobCategory } from '../../../types/job_category';
import type { IJobCategoryRepository } from '../repositories';
import { execToRecords, mapRowToJobCategory } from './row_mapper';

export class SqliteJobCategoryRepository implements IJobCategoryRepository {
    constructor(private readonly db: Database) {}

    async getJobCategories(job_id: string): Promise<JobCategory[]> {
        const rows = execToRecords(this.db, `SELECT * FROM job_category WHERE job_id = ? ORDER BY created_at ASC`, [
            job_id,
        ]);
        return rows.map(mapRowToJobCategory);
    }

    async getCategoryJobs(category_id: string): Promise<JobCategory[]> {
        const rows = execToRecords(
            this.db,
            `SELECT * FROM job_category WHERE category_id = ? ORDER BY created_at ASC`,
            [category_id],
        );
        return rows.map(mapRowToJobCategory);
    }

    async upsertJobCategory(jc: JobCategory): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO job_category (id, job_id, category_id, is_default, created_at) VALUES (?, ?, ?, ?, ?)`,
            [jc.id, jc.job_id, jc.category_id, jc.is_default ? 1 : 0, jc.created_at],
        );
    }

    async deleteJobCategory(id: string): Promise<void> {
        this.db.run(`DELETE FROM job_category WHERE id = ?`, [id]);
    }

    async deleteByJobId(job_id: string): Promise<void> {
        this.db.run(`DELETE FROM job_category WHERE job_id = ?`, [job_id]);
    }
}
