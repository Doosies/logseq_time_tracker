// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteExternalRefRepository } from '../../adapters/storage/sqlite/sqlite_external_ref_repository';
import { SqliteJobRepository } from '../../adapters/storage/sqlite/sqlite_job_repository';
import type { ExternalRef } from '../../types/external_ref';
import type { Job } from '../../types/job';

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

function makeRef(overrides: Partial<ExternalRef> = {}): ExternalRef {
    return {
        id: 'ref1',
        job_id: 'j1',
        system_key: 'logseq',
        ref_value: 'page-uuid-abc',
        created_at: NOW,
        updated_at: NOW,
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

describe('SqliteExternalRefRepository', () => {
    it('upsert 후 getExternalRefs로 조회한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef());

        const refs = await repo.getExternalRefs('j1');
        expect(refs).toHaveLength(1);
        expect(refs[0]!.system_key).toBe('logseq');
        expect(refs[0]!.ref_value).toBe('page-uuid-abc');
    });

    it('getExternalRef로 (job_id, system_key) 쌍을 조회한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef());

        const found = await repo.getExternalRef('j1', 'logseq');
        expect(found?.id).toBe('ref1');

        const missing = await repo.getExternalRef('j1', 'ecount');
        expect(missing).toBeNull();
    });

    it('getExternalRefBySystemAndValue로 시스템키+값 조합을 조회한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef());

        const found = await repo.getExternalRefBySystemAndValue('logseq', 'page-uuid-abc');
        expect(found?.job_id).toBe('j1');

        const missing = await repo.getExternalRefBySystemAndValue('logseq', 'nonexistent');
        expect(missing).toBeNull();
    });

    it('(job_id, system_key) UNIQUE 제약: 동일 쌍 upsert 시 덮어쓴다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef({ id: 'ref1', ref_value: 'old' }));
        await repo.upsertExternalRef(makeRef({ id: 'ref1', ref_value: 'new' }));

        const refs = await repo.getExternalRefs('j1');
        expect(refs).toHaveLength(1);
        expect(refs[0]!.ref_value).toBe('new');
    });

    it('deleteExternalRef로 단건 삭제한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef());
        await repo.deleteExternalRef('ref1');

        expect(await repo.getExternalRef('j1', 'logseq')).toBeNull();
    });

    it('deleteByJobId로 특정 Job의 모든 참조를 삭제한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef({ id: 'r1', job_id: 'j1', system_key: 'logseq' }));
        await repo.upsertExternalRef(makeRef({ id: 'r2', job_id: 'j1', system_key: 'ecount' }));
        await repo.upsertExternalRef(makeRef({ id: 'r3', job_id: 'j2', system_key: 'logseq' }));

        await repo.deleteByJobId('j1');

        expect(await repo.getExternalRefs('j1')).toHaveLength(0);
        expect(await repo.getExternalRefs('j2')).toHaveLength(1);
    });

    it('존재하지 않는 Job의 참조를 조회하면 빈 배열을 반환한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        const refs = await repo.getExternalRefs('nonexistent');
        expect(refs).toEqual([]);
    });

    it('system_key ASC 정렬로 반환한다', async () => {
        const repo = new SqliteExternalRefRepository(db);
        await repo.upsertExternalRef(makeRef({ id: 'r1', system_key: 'zzz' }));
        await repo.upsertExternalRef(makeRef({ id: 'r2', system_key: 'aaa' }));

        const refs = await repo.getExternalRefs('j1');
        expect(refs.map((r) => r.system_key)).toEqual(['aaa', 'zzz']);
    });
});
