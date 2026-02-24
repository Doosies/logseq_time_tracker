import { defineConfig, mergeConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import type { UserConfig } from 'vite';

const base_config = defineConfig({
    plugins: [svelte({ hot: false }), vanillaExtractPlugin()],
    resolve: { conditions: ['browser'] },
    test: {
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'src/**/*.svelte.test.ts'],
        globals: true,
        server: {
            deps: { inline: ['@storybook/svelte'] },
        },
    },
});

export function createSvelteVitestConfig(overrides?: UserConfig) {
    return overrides ? mergeConfig(base_config, overrides) : base_config;
}
