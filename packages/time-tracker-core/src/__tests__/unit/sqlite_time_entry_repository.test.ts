// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteCategoryRepository } from '../../adapters/storage/sqlite/sqlite_category_repository';
import { SqliteJobRepository } from '../../adapters/storage/sqlite/sqlite_job_repository';
import { SqliteTimeEntryRepository } from '../../adapters/storage/sqlite/sqlite_time_entry_repository';
import type { Category } from '../../types/category';
import type { Job } from '../../types/job';
import type { TimeEntry } from '../../types/time_entry';

let db: Database;

const ts = '2026-03-01T12:00:00.000Z';

function makeCategory(id: string): Category {
    return {
        id,
        name: `이름-${id}`,
        parent_id: null,
        is_active: true,
        sort_order: 0,
        created_at: ts,
        updated_at: ts,
    };
}

function makeJob(id: string): Job {
    return {
        id,
        title: 'J',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: ts,
        updated_at: ts,
    };
}

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
    return {
        id: 'e1',
        job_id: 'j1',
        category_id: 'c1',
        started_at: '2026-03-01T08:00:00.000Z',
        ended_at: '2026-03-01T09:00:00.000Z',
        duration_seconds: 3600,
        note: '',
        is_manual: false,
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
    const cat_repo = new SqliteCategoryRepository(db);
    const job_repo = new SqliteJobRepository(db);
    await cat_repo.upsertCategory(makeCategory('c1'));
    await cat_repo.upsertCategory(makeCategory('c2'));
    await job_repo.upsertJob(makeJob('j1'));
    await job_repo.upsertJob(makeJob('j2'));
});

afterEach(() => {
    db.close();
});

describe('SqliteTimeEntryRepository', () => {
    it('upsert·getTimeEntryById·deleteTimeEntry CRUD', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        const entry = makeEntry({ id: 'e1' });
        await repo.upsertTimeEntry(entry);
        expect(await repo.getTimeEntryById('e1')).toMatchObject({ job_id: 'j1', is_manual: false });
        await repo.deleteTimeEntry('e1');
        expect(await repo.getTimeEntryById('e1')).toBeNull();
    });

    it('is_manual true/false가 INTEGER와 왕복한다', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        await repo.upsertTimeEntry(makeEntry({ id: 'manual', is_manual: true }));
        const got = await repo.getTimeEntryById('manual');
        expect(got?.is_manual).toBe(true);
    });

    it('getTimeEntries: job_id 필터', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        await repo.upsertTimeEntry(makeEntry({ id: 'a', job_id: 'j1', started_at: '2026-03-01T10:00:00.000Z' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'b', job_id: 'j2', started_at: '2026-03-01T11:00:00.000Z' }));
        const rows = await repo.getTimeEntries({ job_id: 'j1' });
        expect(rows.map((r) => r.id)).toEqual(['a']);
    });

    it('getTimeEntries: category_id 필터', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        await repo.upsertTimeEntry(makeEntry({ id: 'a', category_id: 'c1', started_at: '2026-03-01T10:00:00.000Z' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'b', category_id: 'c2', started_at: '2026-03-01T11:00:00.000Z' }));
        const rows = await repo.getTimeEntries({ category_id: 'c2' });
        expect(rows.map((r) => r.id)).toEqual(['b']);
    });

    it('getTimeEntries: from_date·to_date 조합', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        await repo.upsertTimeEntry(makeEntry({ id: 'early', started_at: '2026-03-01T06:00:00.000Z' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'mid', started_at: '2026-03-01T12:00:00.000Z' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'late', started_at: '2026-03-01T18:00:00.000Z' }));
        const rows = await repo.getTimeEntries({
            from_date: '2026-03-01T10:00:00.000Z',
            to_date: '2026-03-01T14:00:00.000Z',
        });
        expect(rows.map((r) => r.id)).toEqual(['mid']);
    });

    it('getTimeEntries: job_id·category_id·기간을 함께 적용', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        await repo.upsertTimeEntry(
            makeEntry({
                id: 'hit',
                job_id: 'j1',
                category_id: 'c1',
                started_at: '2026-03-01T12:00:00.000Z',
            }),
        );
        await repo.upsertTimeEntry(
            makeEntry({
                id: 'wrong_job',
                job_id: 'j2',
                category_id: 'c1',
                started_at: '2026-03-01T12:00:00.000Z',
            }),
        );
        const rows = await repo.getTimeEntries({
            job_id: 'j1',
            category_id: 'c1',
            from_date: '2026-03-01T00:00:00.000Z',
            to_date: '2026-03-01T23:59:59.999Z',
        });
        expect(rows.map((r) => r.id)).toEqual(['hit']);
    });

    it('deleteByJobId로 해당 job의 기록만 삭제', async () => {
        const repo = new SqliteTimeEntryRepository(db);
        await repo.upsertTimeEntry(makeEntry({ id: 'x', job_id: 'j1' }));
        await repo.upsertTimeEntry(makeEntry({ id: 'y', job_id: 'j2' }));
        await repo.deleteByJobId('j1');
        expect(await repo.getTimeEntryById('x')).toBeNull();
        expect(await repo.getTimeEntryById('y')).not.toBeNull();
    });
});
