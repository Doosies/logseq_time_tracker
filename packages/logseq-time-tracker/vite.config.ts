/// <reference types="vitest/config" />

import { createRequire } from 'node:module';

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const logseqDevPlugin = require('vite-plugin-logseq').default;

export default defineConfig(({ mode }) => ({
    plugins: [...(mode !== 'test' ? [logseqDevPlugin()] : []), vanillaExtractPlugin(), svelte()],
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: true,
    },
    test: {
        // Playwright E2E는 `npx playwright test`로만 실행 (Vitest와 러너가 다름)
        exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    },
}));
