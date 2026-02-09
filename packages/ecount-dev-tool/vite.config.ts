import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import webExtension from 'vite-plugin-web-extension';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        svelte(),
        vanillaExtractPlugin(),
        webExtension({
            manifest: './src/manifest.json',
            browser: 'chrome',
        }),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: true,
        cssMinify: true,
        rollupOptions: {
            output: {
                // Chrome Extension 최적화
                manualChunks: undefined,
            },
        },
    },
    optimizeDeps: {
        exclude: ['svelte'],
    },
});
