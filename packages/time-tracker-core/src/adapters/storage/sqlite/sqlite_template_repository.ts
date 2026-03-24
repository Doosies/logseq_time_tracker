import type { Database } from 'sql.js';
import type { JobTemplate } from '../../../types/template';
import type { ITemplateRepository } from '../repositories';
import { execToRecords, mapRowToJobTemplate } from './row_mapper';

export class SqliteTemplateRepository implements ITemplateRepository {
    constructor(private readonly db: Database) {}

    async getTemplates(): Promise<JobTemplate[]> {
        const rows = execToRecords(this.db, `SELECT * FROM job_template ORDER BY created_at DESC`);
        return rows.map(mapRowToJobTemplate);
    }

    async getTemplateById(id: string): Promise<JobTemplate | null> {
        const rows = execToRecords(this.db, `SELECT * FROM job_template WHERE id = ?`, [id]);
        const row = rows[0];
        return row === undefined ? null : mapRowToJobTemplate(row);
    }

    async upsertTemplate(template: JobTemplate): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO job_template (id, name, content, placeholders, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                template.id,
                template.name,
                template.content,
                template.placeholders,
                template.created_at,
                template.updated_at,
            ],
        );
    }

    async deleteTemplate(id: string): Promise<void> {
        this.db.run(`DELETE FROM job_template WHERE id = ?`, [id]);
    }
}
