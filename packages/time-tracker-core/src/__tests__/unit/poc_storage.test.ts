// @vitest-environment node

import { describe, expect, it } from 'vitest';

import initSqlJs from 'sql.js';

import { testIndexedDbRoundtrip, testOpfsAccess, testSqlJsInit } from '../../adapters/storage/sqlite/poc_storage_test';

const POC_TABLE = 'poc_items';

describe('poc_storage sql.js smoke (node)', () => {
    it('initializes sql.js, runs CRUD, export roundtrip', async () => {
        const SQL = await initSqlJs();
        const db = new SQL.Database();
        db.exec(`CREATE TABLE ${POC_TABLE} (id INTEGER PRIMARY KEY, label TEXT NOT NULL);`);
        db.exec(`INSERT INTO ${POC_TABLE} (label) VALUES ('node-smoke');`);
        const before = db.exec(`SELECT label FROM ${POC_TABLE} WHERE id = 1;`);
        expect(before[0]?.values[0]?.[0]).toBe('node-smoke');

        const exported = db.export();
        expect(exported.byteLength).toBeGreaterThan(0);
        db.close();

        const restored = new SQL.Database(exported);
        const after = restored.exec(`SELECT label FROM ${POC_TABLE} WHERE id = 1;`);
        expect(after[0]?.values[0]?.[0]).toBe('node-smoke');
        restored.close();
    });

    it('testSqlJsInit succeeds in Node (no wasm locateFile)', async () => {
        const result = await testSqlJsInit();
        expect(result.test_name).toBe('sql_js_wasm_init');
        expect(result.success).toBe(true);
    });
});

describe('poc_storage browser-only helpers', () => {
    it('skips OPFS outside browser', async () => {
        const result = await testOpfsAccess();
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/browser-only/i);
    });

    it('skips IndexedDB roundtrip outside browser', async () => {
        const result = await testIndexedDbRoundtrip();
        expect(result.success).toBe(false);
        expect(result.error).toMatch(/browser-only/i);
    });
});
