import type { Database } from 'sql.js';
import type { Category } from '../../../types/category';
import type { ICategoryRepository } from '../repositories';
import { execToRecords, mapRowToCategory } from './row_mapper';

export class SqliteCategoryRepository implements ICategoryRepository {
    constructor(private readonly db: Database) {}

    async getCategories(): Promise<Category[]> {
        const rows = execToRecords(this.db, `SELECT * FROM category ORDER BY sort_order ASC, created_at ASC`);
        return rows.map(mapRowToCategory);
    }

    async getCategoryById(id: string): Promise<Category | null> {
        const rows = execToRecords(this.db, `SELECT * FROM category WHERE id = ?`, [id]);
        const row = rows[0];
        return row === undefined ? null : mapRowToCategory(row);
    }

    async upsertCategory(category: Category): Promise<void> {
        this.db.run(
            `INSERT OR REPLACE INTO category (id, name, parent_id, is_active, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                category.id,
                category.name,
                category.parent_id,
                category.is_active ? 1 : 0,
                category.sort_order,
                category.created_at,
                category.updated_at,
            ],
        );
    }

    async deleteCategory(id: string): Promise<void> {
        this.db.run(`DELETE FROM category WHERE id = ?`, [id]);
    }
}
