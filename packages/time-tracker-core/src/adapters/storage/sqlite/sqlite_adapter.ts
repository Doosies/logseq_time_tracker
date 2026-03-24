import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';
import { StorageError } from '../../../errors/base';
import type { IStorageBackend } from './storage_backend';

export interface SqliteAdapterOptions {
    /** Base URL/path for WASM files, or a full URL ending in `.wasm` (directory is inferred). */
    wasm_url?: string;
    /** Logical DB file name (default `time-tracker.db`). Consumers pass this to backends. */
    db_name?: string;
}

function build_locate_file(wasm_url: string | undefined): ((file: string) => string) | undefined {
    if (wasm_url === undefined || wasm_url === '') {
        return undefined;
    }
    return (file: string) => {
        if (wasm_url.endsWith('.wasm')) {
            const slash = wasm_url.lastIndexOf('/');
            const base = slash >= 0 ? wasm_url.slice(0, slash + 1) : '';
            return `${base}${file}`;
        }
        const with_slash = wasm_url.endsWith('/') ? wasm_url : `${wasm_url}/`;
        return `${with_slash}${file}`;
    };
}

/**
 * sql.js SQLite database bound to an {@link IStorageBackend} for binary persistence.
 */
export class SqliteAdapter {
    private db: Database | null = null;

    constructor(private readonly backend: IStorageBackend) {}

    async initialize(options: SqliteAdapterOptions = {}): Promise<void> {
        const locate_file = build_locate_file(options.wasm_url);
        const SQL = await (locate_file !== undefined ? initSqlJs({ locateFile: locate_file }) : initSqlJs());
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
