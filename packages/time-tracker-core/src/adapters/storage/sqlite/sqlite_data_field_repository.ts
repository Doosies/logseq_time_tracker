import type { Database } from 'sql.js';
import type { DataField } from '../../../types/meta';
import type { IDataFieldRepository } from '../repositories';
import { execToRecords, mapRowToDataField } from './row_mapper';

export class SqliteDataFieldRepository implements IDataFieldRepository {
    constructor(private readonly _db: Database) {}

    async getDataFields(entity_type_id: string): Promise<DataField[]> {
        const rows = execToRecords(
            this._db,
            `SELECT * FROM data_field WHERE entity_type_id = ? ORDER BY (sort_order IS NULL), sort_order ASC`,
            [entity_type_id],
        );
        return rows.map(mapRowToDataField);
    }

    async getDataFieldById(id: string): Promise<DataField | null> {
        const rows = execToRecords(this._db, `SELECT * FROM data_field WHERE id = ? LIMIT 1`, [id]);
        const row = rows[0];
        return row ? mapRowToDataField(row) : null;
    }

    async upsertDataField(field: DataField): Promise<void> {
        this._db.run(
            `INSERT OR REPLACE INTO data_field (
        id, entity_type_id, data_type, key, label, view_type,
        is_required, is_system, default_value, options, relation_entity_key, sort_order, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                field.id,
                field.entity_type_id,
                field.data_type,
                field.key,
                field.label,
                field.view_type,
                field.is_required ? 1 : 0,
                field.is_system ? 1 : 0,
                field.default_value === '' ? null : field.default_value,
                field.options === '' ? null : field.options,
                field.relation_entity_key === '' ? null : field.relation_entity_key,
                field.sort_order,
                field.created_at,
            ],
        );
    }

    async deleteDataField(id: string): Promise<void> {
        this._db.run(`DELETE FROM data_field WHERE id = ?`, [id]);
    }
}
