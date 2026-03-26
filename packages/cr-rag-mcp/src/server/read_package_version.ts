import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Reads version from package.json next to the package root.
 * Resolved at runtime from compiled `dist/server/*.js` → `../../package.json`.
 */
export function readPackageVersion(): string {
    const module_dir = dirname(fileURLToPath(import.meta.url));
    const pkg_path = join(module_dir, '..', '..', 'package.json');
    try {
        const raw = readFileSync(pkg_path, 'utf8');
        const pkg = JSON.parse(raw) as { version?: string };
        return typeof pkg.version === 'string' ? pkg.version : '0.0.0';
    } catch {
        return '0.0.0';
    }
}
