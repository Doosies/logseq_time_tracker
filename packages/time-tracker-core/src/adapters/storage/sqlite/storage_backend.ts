export interface IStorageBackend {
    read(): Promise<Uint8Array | null>;
    write(data: Uint8Array): Promise<void>;
    exists(): Promise<boolean>;
}
