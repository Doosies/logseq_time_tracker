// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteJobRepository } from '../../adapters/storage/sqlite/sqlite_job_repository';
import { StorageError } from '../../errors';
import type { Job } from '../../types/job';

let db: Database;

function makeJob(overrides: Partial<Job> = {}): Job {
    const now = '2026-03-01T10:00:00.000Z';
    return {
        id: 'j1',
        title: '작업',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
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

describe('SqliteJobRepository', () => {
    it('upsert 후 getJobById·getJobs·getJobsByStatus로 조회한다', async () => {
        const repo = new SqliteJobRepository(db);
        const older = makeJob({
            id: 'old',
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z',
        });
        const newer = makeJob({
            id: 'new',
            created_at: '2026-01-01T00:00:00.000Z',
            updated_at: '2026-01-01T00:00:00.000Z',
        });
        await repo.upsertJob(older);
        await repo.upsertJob(newer);

        expect(await repo.getJobById('missing')).toBeNull();
        const by_id = await repo.getJobById('new');
        expect(by_id?.title).toBe('작업');

        const all = await repo.getJobs();
        expect(all.map((j) => j.id)).toEqual(['new', 'old']);

        const pending = await repo.getJobsByStatus('pending');
        expect(pending).toHaveLength(2);
    });

    it('getActiveJob: 진행 중인 작업이 없으면 null', async () => {
        const repo = new SqliteJobRepository(db);
        await repo.upsertJob(makeJob({ id: 'j1', status: 'pending' }));
        expect(await repo.getActiveJob()).toBeNull();
    });

    it('getActiveJob: 진행 중인 작업이 1건이면 반환', async () => {
        const repo = new SqliteJobRepository(db);
        await repo.upsertJob(makeJob({ id: 'j1', status: 'in_progress' }));
        const active = await repo.getActiveJob();
        expect(active?.id).toBe('j1');
        expect(active?.status).toBe('in_progress');
    });

    it('updateJobStatus: 존재하면 갱신', async () => {
        const repo = new SqliteJobRepository(db);
        await repo.upsertJob(makeJob({ id: 'j1', status: 'pending' }));
        await repo.updateJobStatus('j1', 'completed', '2026-03-02T00:00:00.000Z');
        const got = await repo.getJobById('j1');
        expect(got?.status).toBe('completed');
        expect(got?.updated_at).toBe('2026-03-02T00:00:00.000Z');
    });

    it('updateJobStatus: 대상이 없으면 StorageError', async () => {
        const repo = new SqliteJobRepository(db);
        await expect(repo.updateJobStatus('none', 'completed', '2026-03-02T00:00:00.000Z')).rejects.toThrow(
            StorageError,
        );
    });

    it('deleteJob로 행을 제거한다', async () => {
        const repo = new SqliteJobRepository(db);
        await repo.upsertJob(makeJob({ id: 'j1' }));
        await repo.deleteJob('j1');
        expect(await repo.getJobById('j1')).toBeNull();
    });
});
