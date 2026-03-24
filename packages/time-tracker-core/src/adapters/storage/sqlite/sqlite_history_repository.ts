import type { Database } from 'sql.js';
import type { JobHistory, HistoryFilter } from '../../../types/history';
import type { IHistoryRepository } from '../repositories';
import { execToRecords, mapRowToJobHistory } from './row_mapper';

function buildHistoryFilterSql(filters: HistoryFilter): { sql: string; params: (string | number | null)[] } {
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];
    if (filters.job_id !== undefined) {
        conditions.push('job_id = ?');
        params.push(filters.job_id);
    }
    if (filters.from_date !== undefined) {
        conditions.push('occurred_at >= ?');
        params.push(filters.from_date);
    }
    if (filters.to_date !== undefined) {
        conditions.push('occurred_at <= ?');
        params.push(filters.to_date);
    }
    const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return {
        sql: `SELECT * FROM job_history ${where_clause} ORDER BY occurred_at ASC`,
        params,
    };
}

export class SqliteHistoryRepository implements IHistoryRepository {
    constructor(private readonly db: Database) {}

    async getJobHistory(job_id: string): Promise<JobHistory[]> {
        const rows = execToRecords(this.db, `SELECT * FROM job_history WHERE job_id = ? ORDER BY occurred_at ASC`, [
            job_id,
        ]);
        return rows.map(mapRowToJobHistory);
    }

    async getJobHistoryByPeriod(filters: HistoryFilter): Promise<JobHistory[]> {
        const { sql, params } = buildHistoryFilterSql(filters);
        const rows = execToRecords(this.db, sql, params);
        return rows.map(mapRowToJobHistory);
    }

    async appendJobHistory(history_item: JobHistory): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO job_history (id, job_id, from_status, to_status, reason, occurred_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                history_item.id,
                history_item.job_id,
                history_item.from_status,
                history_item.to_status,
                history_item.reason,
                history_item.occurred_at,
                history_item.created_at,
            ],
        );
    }

    async deleteByJobId(job_id: string): Promise<void> {
        this.db.run(`DELETE FROM job_history WHERE job_id = ?`, [job_id]);
    }
}
