export interface ISettingsAdapter {
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    remove(key: string): void;
}
