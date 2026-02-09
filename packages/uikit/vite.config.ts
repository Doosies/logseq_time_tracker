import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
    plugins: [svelte(), vanillaExtractPlugin()],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                design: resolve(__dirname, 'src/design/index.ts'),
            },
            formats: ['es'],
        },
        rollupOptions: {
            external: ['svelte', 'svelte/internal', '@vanilla-extract/css'],
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
            },
        },
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: true,
        cssMinify: true,
    },
    optimizeDeps: {
        exclude: ['svelte'],
    },
});
