// @vitest-environment node

import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteSettingsRepository } from '../../adapters/storage/sqlite/sqlite_settings_repository';
import { StorageError } from '../../errors';
import type { ActiveTimerState } from '../../types/settings';

let db: Database;

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

describe('SqliteSettingsRepository', () => {
    it('존재하지 않는 키는 null', async () => {
        const repo = new SqliteSettingsRepository(db);
        expect(await repo.getSetting('last_selected_category')).toBeNull();
    });

    it('setSetting·getSetting으로 객체 설정을 JSON 왕복', async () => {
        const repo = new SqliteSettingsRepository(db);
        const state: ActiveTimerState = {
            version: 1,
            job_id: 'j1',
            category_id: 'c1',
            started_at: '2026-01-01T00:00:00.000Z',
            is_paused: false,
            accumulated_ms: 0,
        };
        await repo.setSetting('active_timer', state);
        const got = await repo.getSetting('active_timer');
        expect(got).toEqual(state);
    });

    it('문자열 설정 last_selected_category 왕복', async () => {
        const repo = new SqliteSettingsRepository(db);
        await repo.setSetting('last_selected_category', 'cat-99');
        expect(await repo.getSetting('last_selected_category')).toBe('cat-99');
    });

    it('deleteSetting 후 getSetting은 null', async () => {
        const repo = new SqliteSettingsRepository(db);
        await repo.setSetting('last_selected_category', 'x');
        await repo.deleteSetting('last_selected_category');
        expect(await repo.getSetting('last_selected_category')).toBeNull();
    });

    it('손상된 JSON이면 StorageError', async () => {
        const repo = new SqliteSettingsRepository(db);
        db.run(`INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`, ['last_selected_category', '{']);
        await expect(repo.getSetting('last_selected_category')).rejects.toThrow(StorageError);
    });
});
