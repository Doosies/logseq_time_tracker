// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteTemplateRepository } from '../../adapters/storage/sqlite/sqlite_template_repository';
import type { JobTemplate } from '../../types/template';

let db: Database;
const NOW = '2026-03-01T10:00:00.000Z';

function makeTemplate(overrides: Partial<JobTemplate> = {}): JobTemplate {
    return {
        id: 't1',
        name: '기본 템플릿',
        content: '## {{title}}\n작업 내용',
        placeholders: JSON.stringify([{ id: 'p1', key: 'title', label: '제목' }]),
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
});

afterEach(() => {
    db.close();
});

describe('SqliteTemplateRepository', () => {
    it('upsert 후 getTemplateById로 조회한다', async () => {
        const repo = new SqliteTemplateRepository(db);
        await repo.upsertTemplate(makeTemplate());

        const found = await repo.getTemplateById('t1');
        expect(found?.name).toBe('기본 템플릿');
        expect(found?.content).toContain('{{title}}');
    });

    it('getTemplates는 created_at DESC 순으로 반환한다', async () => {
        const repo = new SqliteTemplateRepository(db);
        await repo.upsertTemplate(makeTemplate({ id: 't1', created_at: '2026-01-01T00:00:00.000Z' }));
        await repo.upsertTemplate(makeTemplate({ id: 't2', created_at: '2026-03-01T00:00:00.000Z' }));

        const all = await repo.getTemplates();
        expect(all.map((t) => t.id)).toEqual(['t2', 't1']);
    });

    it('upsert로 기존 템플릿을 갱신한다', async () => {
        const repo = new SqliteTemplateRepository(db);
        await repo.upsertTemplate(makeTemplate({ id: 't1', name: '이전 이름' }));
        await repo.upsertTemplate(makeTemplate({ id: 't1', name: '새 이름' }));

        const found = await repo.getTemplateById('t1');
        expect(found?.name).toBe('새 이름');

        const all = await repo.getTemplates();
        expect(all).toHaveLength(1);
    });

    it('deleteTemplate로 삭제한다', async () => {
        const repo = new SqliteTemplateRepository(db);
        await repo.upsertTemplate(makeTemplate());
        await repo.deleteTemplate('t1');

        expect(await repo.getTemplateById('t1')).toBeNull();
    });

    it('존재하지 않는 id를 조회하면 null을 반환한다', async () => {
        const repo = new SqliteTemplateRepository(db);
        expect(await repo.getTemplateById('nonexistent')).toBeNull();
    });

    it('빈 테이블에서 getTemplates는 빈 배열을 반환한다', async () => {
        const repo = new SqliteTemplateRepository(db);
        expect(await repo.getTemplates()).toEqual([]);
    });

    it('placeholders JSON 문자열이 그대로 보존된다', async () => {
        const repo = new SqliteTemplateRepository(db);
        const placeholders = JSON.stringify([
            { id: 'p1', key: 'title', label: '제목' },
            { id: 'p2', key: 'desc', label: '설명', field_ref: 'df1' },
        ]);
        await repo.upsertTemplate(makeTemplate({ placeholders }));

        const found = await repo.getTemplateById('t1');
        expect(found?.placeholders).toBe(placeholders);
    });
});
