import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { StorageError } from '../../../errors/base';
import type { IStorageBackend } from './storage_backend';
import { loadWasmBinary } from './wasm_loader';

export interface SqliteAdapterOptions {
    /** Base URL/path for WASM files, or a full URL ending in `.wasm` (directory is inferred). */
    wasm_url?: string;
    /** Logical DB file name (default `time-tracker.db`). Consumers pass this to backends. */
    db_name?: string;
}

function is_browser_runtime(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

/**
 * sql.js SQLite database bound to an {@link IStorageBackend} for binary persistence.
 */
export class SqliteAdapter {
    private db: Database | null = null;

    constructor(private readonly backend: IStorageBackend) {}

    async initialize(options: SqliteAdapterOptions = {}): Promise<void> {
        let SQL: Awaited<ReturnType<typeof initSqlJs>>;
        if (options.wasm_url && is_browser_runtime()) {
            const wasm_binary = await loadWasmBinary(options.wasm_url);
            SQL = await initSqlJs({ wasmBinary: wasm_binary } as Parameters<typeof initSqlJs>[0]);
        } else {
            SQL = await initSqlJs();
        }
        const existing = await this.backend.read();
        this.db = existing !== null && existing.length > 0 ? new SQL.Database(existing) : new SQL.Database();
        this.db.run('PRAGMA journal_mode=WAL');
        this.db.run('PRAGMA foreign_keys=ON');
    }

    getDatabase(): Database {
        if (this.db === null) {
            throw new StorageError('Database not initialized', 'getDatabase');
        }
        return this.db;
    }

    async persist(): Promise<void> {
        if (this.db === null) {
            throw new StorageError('Database not initialized', 'persist');
        }
        const data = this.db.export();
        await this.backend.write(data);
    }

    async close(): Promise<void> {
        if (this.db !== null) {
            this.db.close();
            this.db = null;
        }
    }
}
