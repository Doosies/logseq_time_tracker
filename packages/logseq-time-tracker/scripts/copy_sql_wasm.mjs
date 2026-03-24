import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const package_root = path.resolve(__dirname, '..');
const src = require.resolve('sql.js/dist/sql-wasm.wasm');
const dest_dir = path.join(package_root, 'public', 'assets');
const dest_file = path.join(dest_dir, 'sql-wasm.wasm');

fs.mkdirSync(dest_dir, { recursive: true });
fs.copyFileSync(src, dest_file);
