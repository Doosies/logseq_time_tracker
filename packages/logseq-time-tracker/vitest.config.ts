import { defineConfig, mergeConfig } from 'vitest/config';
import type { UserConfig } from 'vite';
import vite_base from './vite.config';

export default defineConfig(async (env) => {
    const resolved: UserConfig =
        typeof vite_base === 'function'
            ? await (vite_base as (e: typeof env) => UserConfig | Promise<UserConfig>)(env)
            : vite_base;
    return mergeConfig(resolved, {
        resolve: {
            conditions: ['browser'],
        },
    });
});
