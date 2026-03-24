import initSqlJs from 'sql.js';

const POC_DB_OBJECT_STORE = 'poc_db_blob';
const POC_IDB_NAME = 'time-tracker-poc';
const POC_IDB_KEY = 'sqlite-export';
const POC_OPFS_FILE = 'test-poc.db';
const POC_TABLE = 'poc_items';
const TEST_NAME_INDEXED_DB = 'indexeddb_sqlite_roundtrip';
const TEST_NAME_OPFS = 'opfs_read_write';
const TEST_NAME_SQL_JS = 'sql_js_wasm_init';

export interface PocResult {
    test_name: string;
    success: boolean;
    error?: string;
    details?: string;
}

function is_browser_runtime(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

function build_locate_file(wasm_base: string | undefined): (file: string) => string {
    return (file: string) => {
        if (wasm_base !== undefined && wasm_base !== '') {
            const with_slash = wasm_base.endsWith('/') ? wasm_base : `${wasm_base}/`;
            return `${with_slash}${file}`;
        }
        return `/assets/${file}`;
    };
}

/**
 * 검증 1: sql.js WASM(브라우저) 또는 Node 로더로 초기화 후 간단한 CRUD.
 */
export async function testSqlJsInit(wasm_url?: string): Promise<PocResult> {
    try {
        const locate_file = build_locate_file(wasm_url);
        const SQL = is_browser_runtime() ? await initSqlJs({ locateFile: locate_file }) : await initSqlJs();
        const db = new SQL.Database();
        db.exec(`CREATE TABLE ${POC_TABLE} (id INTEGER PRIMARY KEY, label TEXT NOT NULL);`);
        db.exec(`INSERT INTO ${POC_TABLE} (label) VALUES ('poc');`);
        const rows = db.exec(`SELECT label FROM ${POC_TABLE} WHERE id = 1;`);
        db.close();
        const label = rows[0]?.values[0]?.[0];
        const ok = label === 'poc';
        const result: PocResult = {
            test_name: TEST_NAME_SQL_JS,
            success: ok,
            details: ok ? 'CREATE / INSERT / SELECT succeeded' : `unexpected label: ${String(label)}`,
        };
        return result;
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return { test_name: TEST_NAME_SQL_JS, success: false, error: message };
    }
}

/**
 * 검증 2: OPFS에 바이너리 쓰기 후 읽어 왕복 확인 (브라우저 전용).
 */
export async function testOpfsAccess(): Promise<PocResult> {
    if (!is_browser_runtime()) {
        return {
            test_name: TEST_NAME_OPFS,
            success: false,
            error: 'OPFS is browser-only; skipped outside browser',
        };
    }
    try {
        const storage_api = navigator.storage;
        if (!storage_api?.getDirectory) {
            return {
                test_name: TEST_NAME_OPFS,
                success: false,
                error: 'navigator.storage.getDirectory is not available',
            };
        }
        const root = await storage_api.getDirectory();
        const handle = await root.getFileHandle(POC_OPFS_FILE, { create: true });
        const payload = new Uint8Array([1, 2, 3, 4, 5]);
        const writable = await handle.createWritable();
        await writable.write(payload);
        await writable.close();
        const file = await handle.getFile();
        const read_back = new Uint8Array(await file.arrayBuffer());
        const same_length = read_back.length === payload.length;
        const same_bytes = same_length && read_back.every((b, i) => b === payload[i]!);
        const result: PocResult = {
            test_name: TEST_NAME_OPFS,
            success: same_bytes,
            details: same_bytes ? `wrote/read ${payload.length} bytes` : 'byte mismatch after OPFS roundtrip',
        };
        return result;
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return { test_name: TEST_NAME_OPFS, success: false, error: message };
    }
}

function idb_open_promise(db_name: string, version: number): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(db_name, version);
        request.onerror = () => {
            reject(request.error ?? new Error('indexedDB.open failed'));
        };
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(POC_DB_OBJECT_STORE)) {
                db.createObjectStore(POC_DB_OBJECT_STORE);
            }
        };
    });
}

function idb_tx_promise<T>(
    db: IDBDatabase,
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(POC_DB_OBJECT_STORE, mode);
        const store = tx.objectStore(POC_DB_OBJECT_STORE);
        const req = run(store);
        req.onerror = () => {
            reject(req.error ?? new Error('IndexedDB request failed'));
        };
        req.onsuccess = () => {
            resolve(req.result as T);
        };
    });
}

/**
 * 검증 3: sql.js DB export → IndexedDB 저장 → 로드 후 SELECT로 왕복 (브라우저 전용).
 */
export async function testIndexedDbRoundtrip(wasm_url?: string): Promise<PocResult> {
    if (!is_browser_runtime() || typeof indexedDB === 'undefined') {
        return {
            test_name: TEST_NAME_INDEXED_DB,
            success: false,
            error: 'IndexedDB is browser-only; skipped outside browser',
        };
    }
    try {
        const locate_file = build_locate_file(wasm_url);
        const SQL = is_browser_runtime() ? await initSqlJs({ locateFile: locate_file }) : await initSqlJs();
        const db = new SQL.Database();
        db.exec(`CREATE TABLE ${POC_TABLE} (id INTEGER PRIMARY KEY, name TEXT NOT NULL);`);
        db.exec(`INSERT INTO ${POC_TABLE} (name) VALUES ('idb-roundtrip');`);
        const exported = db.export();
        db.close();

        const idb = await idb_open_promise(POC_IDB_NAME, 1);
        await idb_tx_promise(idb, 'readwrite', (store) => store.put(exported, POC_IDB_KEY));
        const loaded = await idb_tx_promise<Uint8Array | undefined>(idb, 'readonly', (store) => store.get(POC_IDB_KEY));
        idb.close();

        if (!loaded || loaded.length === 0) {
            return {
                test_name: TEST_NAME_INDEXED_DB,
                success: false,
                error: 'no blob loaded from IndexedDB',
            };
        }

        const restored = new SQL.Database(loaded);
        const rows = restored.exec(`SELECT name FROM ${POC_TABLE} WHERE id = 1;`);
        restored.close();
        const name = rows[0]?.values[0]?.[0];
        const ok = name === 'idb-roundtrip';
        const result: PocResult = {
            test_name: TEST_NAME_INDEXED_DB,
            success: ok,
            details: ok ? `roundtrip ${loaded.length} bytes` : `unexpected name: ${String(name)}`,
        };
        return result;
    } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return { test_name: TEST_NAME_INDEXED_DB, success: false, error: message };
    }
}

/**
 * PoC 전체 실행 (브라우저에서는 wasm_url 기본 `/assets/...`).
 */
export async function runAllPocTests(wasm_url?: string): Promise<PocResult[]> {
    const sql_result = await testSqlJsInit(wasm_url);
    const opfs_result = await testOpfsAccess();
    const idb_result = await testIndexedDbRoundtrip(wasm_url);
    return [sql_result, opfs_result, idb_result];
}
