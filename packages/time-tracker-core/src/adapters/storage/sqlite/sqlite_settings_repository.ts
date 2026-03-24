import type { Database } from 'sql.js';
import { StorageError } from '../../../errors';
import type { SettingsMap } from '../../../types/settings';
import type { ISettingsRepository } from '../repositories';
import { execToRecords } from './row_mapper';

export class SqliteSettingsRepository implements ISettingsRepository {
    constructor(private readonly db: Database) {}

    async getSetting<K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K] | null> {
        const key_str = String(key);
        const rows = execToRecords(this.db, `SELECT value FROM app_settings WHERE key = ?`, [key_str]);
        const row = rows[0];
        if (row === undefined) {
            return null;
        }
        const raw = row['value'];
        if (raw === null || raw === undefined) {
            return null;
        }
        try {
            return JSON.parse(String(raw)) as SettingsMap[K];
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            throw new StorageError(`Invalid JSON for setting ${key_str}: ${message}`, 'getSetting');
        }
    }

    async setSetting<K extends keyof SettingsMap>(key: K, value: SettingsMap[K]): Promise<void> {
        const key_str = String(key);
        const json = JSON.stringify(value);
        this.db.run(`INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`, [key_str, json]);
    }

    async deleteSetting<K extends keyof SettingsMap>(key: K): Promise<void> {
        this.db.run(`DELETE FROM app_settings WHERE key = ?`, [String(key)]);
    }
}
