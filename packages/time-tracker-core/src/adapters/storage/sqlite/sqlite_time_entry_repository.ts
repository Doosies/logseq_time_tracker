import type { Database } from 'sql.js';
import type { TimeEntry, TimeEntryFilter } from '../../../types/time_entry';
import type { ITimeEntryRepository } from '../repositories';
import { execToRecords, mapRowToTimeEntry } from './row_mapper';

function buildTimeEntryFilterSql(filters?: TimeEntryFilter): { sql: string; params: (string | number | null)[] } {
    const conditions: string[] = [];
    const params: (string | number | null)[] = [];
    if (filters?.job_id !== undefined) {
        conditions.push('job_id = ?');
        params.push(filters.job_id);
    }
    if (filters?.category_id !== undefined) {
        conditions.push('category_id = ?');
        params.push(filters.category_id);
    }
    if (filters?.from_date !== undefined) {
        conditions.push('started_at >= ?');
        params.push(filters.from_date);
    }
    if (filters?.to_date !== undefined) {
        conditions.push('started_at <= ?');
        params.push(filters.to_date);
    }
    const where_clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return {
        sql: `SELECT * FROM time_entry ${where_clause} ORDER BY started_at DESC`,
        params,
    };
}

export class SqliteTimeEntryRepository implements ITimeEntryRepository {
    constructor(private readonly db: Database) {}

    async getTimeEntries(filters?: TimeEntryFilter): Promise<TimeEntry[]> {
        const { sql, params } = buildTimeEntryFilterSql(filters);
        const rows = execToRecords(this.db, sql, params);
        return rows.map(mapRowToTimeEntry);
    }

    async getTimeEntryById(id: string): Promise<TimeEntry | null> {
        const rows = execToRecords(this.db, `SELECT * FROM time_entry WHERE id = ?`, [id]);
        const row = rows[0];
        return row === undefined ? null : mapRowToTimeEntry(row);
    }

    async upsertTimeEntry(entry: TimeEntry): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO time_entry (id, job_id, category_id, started_at, ended_at, duration_seconds, note, is_manual, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                entry.id,
                entry.job_id,
                entry.category_id,
                entry.started_at,
                entry.ended_at,
                entry.duration_seconds,
                entry.note,
                entry.is_manual ? 1 : 0,
                entry.created_at,
                entry.updated_at,
            ],
        );
    }

    async deleteTimeEntry(id: string): Promise<void> {
        this.db.run(`DELETE FROM time_entry WHERE id = ?`, [id]);
    }

    async deleteByJobId(job_id: string): Promise<void> {
        this.db.run(`DELETE FROM time_entry WHERE job_id = ?`, [job_id]);
    }
}
