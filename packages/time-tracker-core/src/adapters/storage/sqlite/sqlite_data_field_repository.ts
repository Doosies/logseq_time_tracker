import type { Database } from 'sql.js';
import type { DataField } from '../../../types/meta';
import type { IDataFieldRepository } from '../repositories';

/**
 * Phase 2B DDL에 `data_field` 테이블이 없어 스텁입니다.
 * 마이그레이션 추가 전까지 조회는 항상 빈 배열, 쓰기/삭제는 no-op입니다.
 */
export class SqliteDataFieldRepository implements IDataFieldRepository {
    /** sql.js DB (reserved for Phase 2G+ when data_field DDL exists). */
    constructor(private readonly _db: Database) {}

    async getDataFields(_entity_type_id: string): Promise<DataField[]> {
        return [];
    }

    async upsertDataField(_field: DataField): Promise<void> {
        // no-op until data_field table exists
    }

    async deleteDataField(_id: string): Promise<void> {
        // no-op until data_field table exists
    }
}
