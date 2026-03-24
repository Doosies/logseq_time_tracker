import type { Database } from 'sql.js';

export interface Migration {
    version: number;
    description: string;
    up(db: Database): void;
}

const SCHEMA_KEY = 'schema_version';

/**
 * Forward-only, per-migration transaction runner for sql.js (synchronous SQLite).
 */
export class MigrationRunner {
    private readonly sorted_migrations: Migration[];

    constructor(
        private readonly db: Database,
        migrations: Migration[],
    ) {
        this.sorted_migrations = [...migrations].sort((a, b) => a.version - b.version);
    }

    private ensure_app_settings_table(): void {
        this.db.run(`CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);
    }

    private read_schema_version(): number {
        this.ensure_app_settings_table();
        const stmt = this.db.prepare(`SELECT value FROM app_settings WHERE key = ?`);
        stmt.bind([SCHEMA_KEY]);
        const has_row = stmt.step();
        if (!has_row) {
            stmt.free();
            return 0;
        }
        const row = stmt.get();
        stmt.free();
        const raw = row[0];
        const parsed = parseInt(String(raw), 10);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    private set_schema_version(version: number): void {
        this.db.run(`INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`, [SCHEMA_KEY, String(version)]);
    }

    getCurrentVersion(): number {
        return this.read_schema_version();
    }

    run(): void {
        this.ensure_app_settings_table();
        let current = this.read_schema_version();
        for (const migration of this.sorted_migrations) {
            if (migration.version <= current) {
                continue;
            }
            this.db.run('BEGIN');
            try {
                migration.up(this.db);
                this.set_schema_version(migration.version);
                this.db.run('COMMIT');
                current = migration.version;
            } catch (e) {
                this.db.run('ROLLBACK');
                throw e;
            }
        }
    }
}
