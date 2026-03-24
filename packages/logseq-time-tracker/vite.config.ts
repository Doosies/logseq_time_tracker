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
}));
