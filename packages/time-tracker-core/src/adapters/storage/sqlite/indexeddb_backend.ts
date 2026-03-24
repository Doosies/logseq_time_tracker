import { StorageError } from '../../../errors/base';
import type { IStorageBackend } from './storage_backend';

const IDB_NAME = 'time-tracker-storage';
const IDB_STORE = 'db_files';
const IDB_VERSION = 1;
const IDB_OPERATION = 'indexeddb';

function open_storage_db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new StorageError('IndexedDB is not available', IDB_OPERATION));
            return;
        }
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onerror = () => {
            reject(request.error ?? new StorageError('indexedDB.open failed', IDB_OPERATION));
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE);
            }
        };
    });
}

function idb_request<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onerror = () => {
            reject(req.error ?? new StorageError('IndexedDB request failed', IDB_OPERATION));
        };
        req.onsuccess = () => {
            resolve(req.result as T);
        };
    });
}

/**
 * IndexedDB-backed binary persistence. Key is `db_key` (e.g. `time-tracker.db`).
 */
export class IndexedDbBackend implements IStorageBackend {
    constructor(private readonly db_key: string) {}

    async read(): Promise<Uint8Array | null> {
        const db = await open_storage_db();
        try {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const store = tx.objectStore(IDB_STORE);
            const raw = await idb_request<Uint8Array | undefined>(store.get(this.db_key));
            if (raw === undefined || raw === null) {
                return null;
            }
            return raw instanceof Uint8Array ? raw : new Uint8Array(raw as ArrayBuffer);
        } finally {
            db.close();
        }
    }

    async write(data: Uint8Array): Promise<void> {
        const db = await open_storage_db();
        try {
            await new Promise<void>((resolve, reject) => {
                const tx = db.transaction(IDB_STORE, 'readwrite');
                tx.oncomplete = () => {
                    resolve();
                };
                tx.onerror = () => {
                    reject(tx.error ?? new StorageError('IndexedDB transaction failed', IDB_OPERATION));
                };
                tx.onabort = () => {
                    reject(new StorageError('IndexedDB transaction aborted', IDB_OPERATION));
                };
                const store = tx.objectStore(IDB_STORE);
                store.put(data, this.db_key);
            });
        } finally {
            db.close();
        }
    }

    async exists(): Promise<boolean> {
        const blob = await this.read();
        return blob !== null;
    }
}
