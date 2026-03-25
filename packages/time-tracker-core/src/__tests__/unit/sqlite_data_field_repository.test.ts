// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteDataFieldRepository } from '../../adapters/storage/sqlite/sqlite_data_field_repository';
import type { DataField } from '../../types/meta';

let db: Database;

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'df1',
        entity_type_id: 'job',
        data_type: 'string',
        key: 'custom_name',
        label: '커스텀 이름',
        view_type: 'text',
        is_required: false,
        is_system: false,
        default_value: '',
        options: '{}',
        relation_entity_key: '',
        sort_order: 0,
        created_at: '2026-03-01T10:00:00.000Z',
        ...overrides,
    };
}

beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    const runner = new MigrationRunner(db, ALL_MIGRATIONS);
    runner.run();
});

afterEach(() => {
    db.close();
});

describe('SqliteDataFieldRepository (스텁 — data_field DDL 미존재)', () => {
    it('getDataFields는 항상 빈 배열을 반환한다', async () => {
        const repo = new SqliteDataFieldRepository(db);
        const fields = await repo.getDataFields('job');
        expect(fields).toEqual([]);
    });

    it('upsertDataField는 에러 없이 no-op 수행한다', async () => {
        const repo = new SqliteDataFieldRepository(db);
        await expect(repo.upsertDataField(makeField())).resolves.toBeUndefined();
    });

    it('deleteDataField는 에러 없이 no-op 수행한다', async () => {
        const repo = new SqliteDataFieldRepository(db);
        await expect(repo.deleteDataField('df1')).resolves.toBeUndefined();
    });
});
