// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { StorageError } from '../../errors/base';
import { MigrationRunner } from '../../adapters/storage/sqlite/migration_runner';
import { ALL_MIGRATIONS } from '../../adapters/storage/sqlite/migrations';
import { SqliteAdapter } from '../../adapters/storage/sqlite/sqlite_adapter';
import type { IStorageBackend } from '../../adapters/storage/sqlite/storage_backend';

class MemoryStorageBackend implements IStorageBackend {
    private data: Uint8Array | null = null;

    async read(): Promise<Uint8Array | null> {
        return this.data;
    }

    async write(data: Uint8Array): Promise<void> {
        this.data = new Uint8Array(data);
    }

    async exists(): Promise<boolean> {
        return this.data !== null;
    }
}

describe('SqliteAdapter', () => {
    it('UC-SQL-ADPT-001: 미초기화 상태에서 getDatabase는 StorageError를 던진다', () => {
        const backend = new MemoryStorageBackend();
        const adapter = new SqliteAdapter(backend);
        expect(() => {
            adapter.getDatabase();
        }).toThrow(StorageError);
        expect(() => {
            adapter.getDatabase();
        }).toThrow('Database not initialized');
    });

    it('UC-SQL-ADPT-002: 미초기화 상태에서 persist는 StorageError를 던진다', async () => {
        const backend = new MemoryStorageBackend();
        const adapter = new SqliteAdapter(backend);
        await expect(adapter.persist()).rejects.toThrow(StorageError);
    });

    it('UC-SQL-ADPT-003: initialize → getDatabase → persist 기본 흐름', async () => {
        const backend = new MemoryStorageBackend();
        const adapter = new SqliteAdapter(backend);
        await adapter.initialize({});
        const db = adapter.getDatabase();
        new MigrationRunner(db, ALL_MIGRATIONS).run();
        db.run(`INSERT INTO job (id, title, status, created_at, updated_at) VALUES ('j1', 't', 'pending', 'a', 'b')`);
        await adapter.persist();
        expect(await backend.exists()).toBe(true);
        await adapter.close();
    });

    it('UC-SQL-ADPT-004: backend.read 버퍼로 기존 DB를 복원한다', async () => {
        const backend = new MemoryStorageBackend();
        const first = new SqliteAdapter(backend);
        await first.initialize({});
        const db1 = first.getDatabase();
        new MigrationRunner(db1, ALL_MIGRATIONS).run();
        db1.run(`INSERT INTO job (id, title, status, created_at, updated_at) VALUES ('j1', 't', 'pending', 'a', 'b')`);
        await first.persist();
        await first.close();

        const second = new SqliteAdapter(backend);
        await second.initialize({});
        const db2 = second.getDatabase();
        const rows = db2.exec(`SELECT id FROM job WHERE id = 'j1'`);
        expect(rows[0]?.values[0]?.[0]).toBe('j1');
        await second.close();
    });
});
