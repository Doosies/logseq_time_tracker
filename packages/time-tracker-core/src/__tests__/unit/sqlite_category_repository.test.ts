// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteCategoryRepository } from '../../adapters/storage/sqlite/sqlite_category_repository';
import type { Category } from '../../types/category';

let db: Database;

const ts = '2026-03-01T12:00:00.000Z';

function makeCategory(overrides: Partial<Category> = {}): Category {
    return {
        id: 'c1',
        name: '분류',
        parent_id: null,
        is_active: true,
        sort_order: 1,
        created_at: ts,
        updated_at: ts,
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

describe('SqliteCategoryRepository', () => {
    it('upsert·getCategoryById·getCategories·deleteCategory', async () => {
        const repo = new SqliteCategoryRepository(db);
        await repo.upsertCategory(makeCategory({ id: 'root', sort_order: 0 }));
        await repo.upsertCategory(makeCategory({ id: 'child', parent_id: 'root', sort_order: 1 }));
        expect(await repo.getCategoryById('none')).toBeNull();
        const child = await repo.getCategoryById('child');
        expect(child?.parent_id).toBe('root');
        const all = await repo.getCategories();
        expect(all.map((c) => c.id)).toEqual(['root', 'child']);
        await repo.deleteCategory('child');
        expect(await repo.getCategoryById('child')).toBeNull();
    });

    it('is_active true는 저장 후 true로 읽힌다', async () => {
        const repo = new SqliteCategoryRepository(db);
        await repo.upsertCategory(makeCategory({ id: 'on', is_active: true }));
        const got = await repo.getCategoryById('on');
        expect(got?.is_active).toBe(true);
    });

    it('is_active false는 INTEGER 0과 왕복', async () => {
        const repo = new SqliteCategoryRepository(db);
        await repo.upsertCategory(makeCategory({ id: 'off', is_active: false }));
        const got = await repo.getCategoryById('off');
        expect(got?.is_active).toBe(false);
    });
});
