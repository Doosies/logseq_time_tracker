// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteJobCategoryRepository } from '../../adapters/storage/sqlite/sqlite_job_category_repository';
import { SqliteJobRepository } from '../../adapters/storage/sqlite/sqlite_job_repository';
import { SqliteCategoryRepository } from '../../adapters/storage/sqlite/sqlite_category_repository';
import type { JobCategory } from '../../types/job_category';
import type { Job } from '../../types/job';
import type { Category } from '../../types/category';

let db: Database;
const NOW = '2026-03-01T10:00:00.000Z';

function makeJob(id: string): Job {
    return {
        id,
        title: '작업',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: NOW,
        updated_at: NOW,
    };
}

function makeCategory(id: string): Category {
    return { id, name: '카테고리', parent_id: null, is_active: true, sort_order: 0, created_at: NOW, updated_at: NOW };
}

function makeJc(overrides: Partial<JobCategory> = {}): JobCategory {
    return {
        id: 'jc1',
        job_id: 'j1',
        category_id: 'c1',
        is_default: false,
        created_at: NOW,
        ...overrides,
    };
}

beforeEach(async () => {
    const SQL = await initSqlJs();
    db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON');
    const runner = new MigrationRunner(db, ALL_MIGRATIONS);
    runner.run();

    const job_repo = new SqliteJobRepository(db);
    await job_repo.upsertJob(makeJob('j1'));
    await job_repo.upsertJob(makeJob('j2'));

    const cat_repo = new SqliteCategoryRepository(db);
    await cat_repo.upsertCategory(makeCategory('c1'));
    await cat_repo.upsertCategory(makeCategory('c2'));
});

afterEach(() => {
    db.close();
});

describe('SqliteJobCategoryRepository', () => {
    it('UC-SQL-JCAT-001: upsert 후 getJobCategories로 조회한다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc());

        const results = await repo.getJobCategories('j1');
        expect(results).toHaveLength(1);
        expect(results[0]!.category_id).toBe('c1');
        expect(results[0]!.is_default).toBe(false);
    });

    it('UC-SQL-JCAT-002: getCategoryJobs로 카테고리에 연결된 Job들을 조회한다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc({ id: 'jc1', job_id: 'j1', category_id: 'c1' }));
        await repo.upsertJobCategory(makeJc({ id: 'jc2', job_id: 'j2', category_id: 'c1' }));

        const results = await repo.getCategoryJobs('c1');
        expect(results).toHaveLength(2);
    });

    it('UC-SQL-JCAT-003: is_default boolean 변환이 올바르다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc({ id: 'jc1', is_default: true }));

        const results = await repo.getJobCategories('j1');
        expect(results[0]!.is_default).toBe(true);
    });

    it('UC-SQL-JCAT-004: (job_id, category_id) UNIQUE 제약: 동일 쌍 upsert 시 덮어쓴다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc({ id: 'jc1', is_default: false }));
        await repo.upsertJobCategory(makeJc({ id: 'jc1', is_default: true }));

        const results = await repo.getJobCategories('j1');
        expect(results).toHaveLength(1);
        expect(results[0]!.is_default).toBe(true);
    });

    it('UC-SQL-JCAT-005: deleteJobCategory로 단건 삭제한다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc());
        await repo.deleteJobCategory('jc1');

        expect(await repo.getJobCategories('j1')).toHaveLength(0);
    });

    it('UC-SQL-JCAT-006: deleteByJobId로 특정 Job의 모든 연결을 삭제한다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc({ id: 'jc1', job_id: 'j1', category_id: 'c1' }));
        await repo.upsertJobCategory(makeJc({ id: 'jc2', job_id: 'j1', category_id: 'c2' }));
        await repo.upsertJobCategory(makeJc({ id: 'jc3', job_id: 'j2', category_id: 'c1' }));

        await repo.deleteByJobId('j1');

        expect(await repo.getJobCategories('j1')).toHaveLength(0);
        expect(await repo.getJobCategories('j2')).toHaveLength(1);
    });

    it('UC-SQL-JCAT-007: 존재하지 않는 Job/Category를 조회하면 빈 배열을 반환한다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        expect(await repo.getJobCategories('nonexistent')).toEqual([]);
        expect(await repo.getCategoryJobs('nonexistent')).toEqual([]);
    });

    it('UC-SQL-JCAT-008: created_at ASC 정렬로 반환한다', async () => {
        const repo = new SqliteJobCategoryRepository(db);
        await repo.upsertJobCategory(makeJc({ id: 'jc1', category_id: 'c1', created_at: '2026-03-02T00:00:00.000Z' }));
        await repo.upsertJobCategory(makeJc({ id: 'jc2', category_id: 'c2', created_at: '2026-03-01T00:00:00.000Z' }));

        const results = await repo.getJobCategories('j1');
        expect(results.map((r) => r.id)).toEqual(['jc2', 'jc1']);
    });
});
