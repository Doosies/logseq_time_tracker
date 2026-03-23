import type { CrRagConfig } from '../types/config.js';

export function inferFileRole(path: string, config?: CrRagConfig): string {
    if (config?.file_roles?.custom_rules) {
        for (const rule of config.file_roles.custom_rules) {
            if (new RegExp(rule.pattern).test(path)) {
                return rule.role;
            }
        }
    }

    if (config?.file_roles?.use_builtin_patterns !== false) {
        if (/\.(test|spec)\.(ts|js|tsx|jsx)$/.test(path)) {
            return 'test';
        }
        if (/\/components\//.test(path)) {
            return 'component';
        }
        if (/\/hooks\/|\/composables\//.test(path)) {
            return 'hook';
        }
        if (/\/api\/|\/services\//.test(path)) {
            return 'api';
        }
        if (/\/store\/|\/stores\//.test(path)) {
            return 'store';
        }
        if (/\/utils\/|\/helpers\/|\/lib\//.test(path)) {
            return 'util';
        }
        if (/\/types\/|\.d\.ts$/.test(path)) {
            return 'type';
        }
        if (/\.(config|rc)\.(ts|js|json)$/.test(path)) {
            return 'config';
        }
    }

    return 'unknown';
}
