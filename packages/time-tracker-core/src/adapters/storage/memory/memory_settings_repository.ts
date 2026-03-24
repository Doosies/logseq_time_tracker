import type { SettingsMap } from '../../../types/settings';
import type { ISettingsRepository } from '../repositories';

export class MemorySettingsRepository implements ISettingsRepository {
    private readonly _data = new Map<string, unknown>();

    getSnapshot(): Map<string, unknown> {
        const snapshot = new Map<string, unknown>();
        for (const [k, v] of this._data) {
            snapshot.set(k, structuredClone(v));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, unknown>): void {
        this._data.clear();
        for (const [k, v] of data) {
            this._data.set(k, structuredClone(v));
        }
    }

    async getSetting<K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K] | null> {
        const key_str = String(key);
        if (!this._data.has(key_str)) {
            return null;
        }
        const v = this._data.get(key_str);
        return structuredClone(v) as SettingsMap[K];
    }

    async setSetting<K extends keyof SettingsMap>(key: K, value: SettingsMap[K]): Promise<void> {
        this._data.set(String(key), structuredClone(value));
    }

    async deleteSetting<K extends keyof SettingsMap>(key: K): Promise<void> {
        this._data.delete(String(key));
    }
}
