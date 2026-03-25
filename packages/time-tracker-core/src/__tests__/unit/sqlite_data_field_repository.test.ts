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
        entity_type_id: 'et-job',
        data_type: 'string',
        key: 'custom_name',
        label: '커스텀 이름',
        view_type: 'text',
        is_required: false,
        is_system: false,
        default_value: '',
        options: '',
        relation_entity_key: '',
        sort_order: 1,
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

describe('SqliteDataFieldRepository', () => {
    it('UC-SQL-DF-001: upsert 후 getDataFields·getDataFieldById로 조회', async () => {
        const repo = new SqliteDataFieldRepository(db);
        const field = makeField();
        await repo.upsertDataField(field);
        const list = await repo.getDataFields('et-job');
        expect(list).toHaveLength(1);
        expect(list[0]!.key).toBe('custom_name');
        const one = await repo.getDataFieldById('df1');
        expect(one?.id).toBe('df1');
    });

    it('getDataFields: sort_order 기준 정렬', async () => {
        const repo = new SqliteDataFieldRepository(db);
        await repo.upsertDataField(makeField({ id: 'a', key: 'a', sort_order: 10 }));
        await repo.upsertDataField(makeField({ id: 'b', key: 'b', sort_order: 2 }));
        const list = await repo.getDataFields('et-job');
        expect(list.map((f) => f.key)).toEqual(['b', 'a']);
    });

    it('deleteDataField 후 조회되지 않음', async () => {
        const repo = new SqliteDataFieldRepository(db);
        await repo.upsertDataField(makeField());
        await repo.deleteDataField('df1');
        expect(await repo.getDataFields('et-job')).toHaveLength(0);
        expect(await repo.getDataFieldById('df1')).toBeNull();
    });
});
