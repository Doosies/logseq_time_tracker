import type { Database } from 'sql.js';
import type { ExternalRef } from '../../../types/external_ref';
import type { IExternalRefRepository } from '../repositories';
import { execToRecords, mapRowToExternalRef } from './row_mapper';

export class SqliteExternalRefRepository implements IExternalRefRepository {
    constructor(private readonly db: Database) {}

    async getExternalRefs(job_id: string): Promise<ExternalRef[]> {
        const rows = execToRecords(this.db, `SELECT * FROM external_ref WHERE job_id = ? ORDER BY system_key ASC`, [
            job_id,
        ]);
        return rows.map(mapRowToExternalRef);
    }

    async getExternalRef(job_id: string, system_key: string): Promise<ExternalRef | null> {
        const rows = execToRecords(this.db, `SELECT * FROM external_ref WHERE job_id = ? AND system_key = ?`, [
            job_id,
            system_key,
        ]);
        const row = rows[0];
        return row === undefined ? null : mapRowToExternalRef(row);
    }

    async getExternalRefBySystemAndValue(system_key: string, ref_value: string): Promise<ExternalRef | null> {
        const rows = execToRecords(this.db, `SELECT * FROM external_ref WHERE system_key = ? AND ref_value = ?`, [
            system_key,
            ref_value,
        ]);
        const row = rows[0];
        return row === undefined ? null : mapRowToExternalRef(row);
    }

    async upsertExternalRef(ref: ExternalRef): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO external_ref (id, job_id, system_key, ref_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [ref.id, ref.job_id, ref.system_key, ref.ref_value, ref.created_at, ref.updated_at],
        );
    }

    async deleteExternalRef(id: string): Promise<void> {
        this.db.run(`DELETE FROM external_ref WHERE id = ?`, [id]);
    }

    async deleteByJobId(job_id: string): Promise<void> {
        this.db.run(`DELETE FROM external_ref WHERE job_id = ?`, [job_id]);
    }
}
