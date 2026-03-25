// @vitest-environment node

import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import { MigrationRunner, type Migration } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { migration_001_initial } from '../../adapters/storage/sqlite/migrations/001_initial';
import { migration_002_phase2 } from '../../adapters/storage/sqlite/migrations/002_phase2';

async function open_memory_db() {
    const SQL = await initSqlJs();
    return new SQL.Database();
}

function table_names(db: import('sql.js').Database): string[] {
    const rows = db.exec(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`,
    );
    const values = rows[0]?.values ?? [];
    return values.map((row) => String(row[0]));
}

describe('MigrationRunner', () => {
    it('UC-MIGRATE-001: 마이그레이션을 버전 오름차순으로 적용하고 schema_version을 갱신한다', async () => {
        const db = await open_memory_db();
        const runner = new MigrationRunner(db, ALL_MIGRATIONS);
        expect(runner.getCurrentVersion()).toBe(0);
        runner.run();
        expect(runner.getCurrentVersion()).toBe(3);
        const names = table_names(db);
        expect(names).toContain('job');
        expect(names).toContain('external_ref');
        expect(names).toContain('job_template');
        expect(names).toContain('data_field');
        expect(names).toContain('data_type');
        expect(names).toContain('entity_type');
        db.close();
    });

    it('이미 적용된 마이그레이션은 건너뛴다', async () => {
        const db = await open_memory_db();
        const runner = new MigrationRunner(db, ALL_MIGRATIONS);
        runner.run();
        runner.run();
        expect(runner.getCurrentVersion()).toBe(3);
        db.close();
    });

    it('입력 배열이 역순이어도 정렬 후 올바른 순서로 적용한다', async () => {
        const db = await open_memory_db();
        const runner = new MigrationRunner(db, [migration_002_phase2, migration_001_initial]);
        runner.run();
        expect(runner.getCurrentVersion()).toBe(2);
        const names = table_names(db);
        expect(names).toContain('job');
        expect(names).toContain('external_ref');
        db.close();
    });

    it('마이그레이션 실패 시 ROLLBACK 되고 schema_version은 유지된다', async () => {
        const db = await open_memory_db();
        const failing: Migration = {
            version: 4,
            description: 'intentional failure',
            up(inner) {
                inner.exec(`CREATE TABLE IF NOT EXISTS migration_fail_probe (id INTEGER PRIMARY KEY);`);
                throw new Error('migration boom');
            },
        };
        const runner = new MigrationRunner(db, [...ALL_MIGRATIONS, failing]);
        expect(() => {
            runner.run();
        }).toThrow('migration boom');
        expect(runner.getCurrentVersion()).toBe(3);
        const probe = db.exec(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'migration_fail_probe'`);
        expect(probe[0]?.values?.length ?? 0).toBe(0);
        db.close();
    });
});
