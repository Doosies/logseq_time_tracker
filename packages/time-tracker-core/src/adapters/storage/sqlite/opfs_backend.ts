import { StorageError } from '../../../errors/base';
import type { IStorageBackend } from './storage_backend';

const OPFS_OPERATION = 'opfs';

function assert_opfs_available(): void {
    if (typeof navigator === 'undefined' || navigator.storage?.getDirectory === undefined) {
        throw new StorageError('OPFS is not supported in this environment', OPFS_OPERATION);
    }
}

/**
 * OPFS-backed binary persistence for the SQLite file.
 * `db_name` is the file name under the origin private directory.
 */
export class OpfsBackend implements IStorageBackend {
    constructor(private readonly db_name: string) {}

    async read(): Promise<Uint8Array | null> {
        assert_opfs_available();
        try {
            const root = await navigator.storage!.getDirectory();
            const handle = await root.getFileHandle(this.db_name);
            const file = await handle.getFile();
            const buf = await file.arrayBuffer();
            return new Uint8Array(buf);
        } catch (e) {
            if (e instanceof DOMException && e.name === 'NotFoundError') {
                return null;
            }
            const message = e instanceof Error ? e.message : String(e);
            throw new StorageError(`OPFS read failed: ${message}`, OPFS_OPERATION);
        }
    }

    async write(data: Uint8Array): Promise<void> {
        assert_opfs_available();
        try {
            const root = await navigator.storage!.getDirectory();
            const handle = await root.getFileHandle(this.db_name, { create: true });
            const writable = await handle.createWritable();
            const bytes = new Uint8Array(data.length);
            bytes.set(data);
            await writable.write(bytes);
            await writable.close();
        } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            throw new StorageError(`OPFS write failed: ${message}`, OPFS_OPERATION);
        }
    }

    async exists(): Promise<boolean> {
        assert_opfs_available();
        try {
            const root = await navigator.storage!.getDirectory();
            await root.getFileHandle(this.db_name);
            return true;
        } catch (e) {
            if (e instanceof DOMException && e.name === 'NotFoundError') {
                return false;
            }
            const message = e instanceof Error ? e.message : String(e);
            throw new StorageError(`OPFS exists check failed: ${message}`, OPFS_OPERATION);
        }
    }
}
