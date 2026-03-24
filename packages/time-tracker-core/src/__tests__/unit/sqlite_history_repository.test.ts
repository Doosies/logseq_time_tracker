// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteHistoryRepository } from '../../adapters/storage/sqlite/sqlite_history_repository';
import { SqliteJobRepository } from '../../adapters/storage/sqlite/sqlite_job_repository';
import type { JobHistory } from '../../types/history';
import type { Job } from '../../types/job';

let db: Database;

const ts = '2026-03-01T12:00:00.000Z';

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

function makeHistory(overrides: Partial<JobHistory> = {}): JobHistory {
    return {
        id: 'h1',
        job_id: 'j1',
        from_status: null,
        to_status: 'in_progress',
        reason: '',
        occurred_at: '2026-03-01T08:00:00.000Z',
        created_at: ts,
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
});

afterEach(() => {
    db.close();
});

describe('SqliteHistoryRepository', () => {
    it('appendJobHistory 후 getJobHistory로 조회', async () => {
        const repo = new SqliteHistoryRepository(db);
        await repo.appendJobHistory(makeHistory({ id: 'h1', job_id: 'j1', occurred_at: '2026-03-01T09:00:00.000Z' }));
        await repo.appendJobHistory(makeHistory({ id: 'h2', job_id: 'j1', occurred_at: '2026-03-01T10:00:00.000Z' }));
        const rows = await repo.getJobHistory('j1');
        expect(rows).toHaveLength(2);
        expect(rows[0]!.occurred_at <= rows[1]!.occurred_at).toBe(true);
    });

    it('getJobHistoryByPeriod: job_id 필터', async () => {
        const repo = new SqliteHistoryRepository(db);
        await repo.appendJobHistory(makeHistory({ id: 'a', job_id: 'j1' }));
        await repo.appendJobHistory(makeHistory({ id: 'b', job_id: 'j2', occurred_at: '2026-03-01T09:00:00.000Z' }));
        const rows = await repo.getJobHistoryByPeriod({ job_id: 'j2' });
        expect(rows.map((r) => r.id)).toEqual(['b']);
    });

    it('getJobHistoryByPeriod: from_date·to_date', async () => {
        const repo = new SqliteHistoryRepository(db);
        await repo.appendJobHistory(makeHistory({ id: 'e', occurred_at: '2026-03-01T06:00:00.000Z' }));
        await repo.appendJobHistory(makeHistory({ id: 'm', occurred_at: '2026-03-01T12:00:00.000Z' }));
        await repo.appendJobHistory(makeHistory({ id: 'l', occurred_at: '2026-03-01T18:00:00.000Z' }));
        const rows = await repo.getJobHistoryByPeriod({
            from_date: '2026-03-01T10:00:00.000Z',
            to_date: '2026-03-01T14:00:00.000Z',
        });
        expect(rows.map((r) => r.id)).toEqual(['m']);
    });

    it('getJobHistoryByPeriod: job_id와 기간 조합', async () => {
        const repo = new SqliteHistoryRepository(db);
        await repo.appendJobHistory(makeHistory({ id: 'hit', job_id: 'j1', occurred_at: '2026-03-01T12:00:00.000Z' }));
        await repo.appendJobHistory(
            makeHistory({ id: 'other_job', job_id: 'j2', occurred_at: '2026-03-01T12:00:00.000Z' }),
        );
        const rows = await repo.getJobHistoryByPeriod({
            job_id: 'j1',
            from_date: '2026-03-01T00:00:00.000Z',
            to_date: '2026-03-01T23:59:59.999Z',
        });
        expect(rows.map((r) => r.id)).toEqual(['hit']);
    });

    it('deleteByJobId로 해당 job 이력만 삭제', async () => {
        const repo = new SqliteHistoryRepository(db);
        await repo.appendJobHistory(makeHistory({ id: 'x', job_id: 'j1' }));
        await repo.appendJobHistory(makeHistory({ id: 'y', job_id: 'j2' }));
        await repo.deleteByJobId('j1');
        expect(await repo.getJobHistory('j1')).toHaveLength(0);
        expect(await repo.getJobHistory('j2')).toHaveLength(1);
    });
});
