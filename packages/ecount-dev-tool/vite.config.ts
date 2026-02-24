import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig(({ mode }) => ({
    plugins: [
        svelte(),
        vanillaExtractPlugin(),
        webExtension({
            manifest: './src/manifest.json',
            browser: 'chrome',
        }),
    ],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        minify: mode === 'production' ? 'esbuild' : false,
        sourcemap: true,
        cssMinify: mode === 'production',
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
}));
