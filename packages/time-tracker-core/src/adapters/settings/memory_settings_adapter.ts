import type { ISettingsAdapter } from './settings_adapter';

export class MemorySettingsAdapter implements ISettingsAdapter {
    private readonly _data = new Map<string, unknown>();

    get<T>(key: string): T | undefined {
        return this._data.get(key) as T | undefined;
    }

    set<T>(key: string, value: T): void {
        this._data.set(key, structuredClone(value));
    }

    remove(key: string): void {
        this._data.delete(key);
    }
}
