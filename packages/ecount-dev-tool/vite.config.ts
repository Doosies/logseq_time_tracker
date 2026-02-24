import { defineConfig } from 'vite';
import { createSvelteViteConfig } from '../../config/vite.shared';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig(({ mode }) =>
    createSvelteViteConfig({
        plugins: [webExtension({ manifest: './src/manifest.json', browser: 'chrome' })],
        build: {
            outDir: 'dist',
            emptyOutDir: true,
            minify: mode === 'production' ? 'esbuild' : false,
            cssMinify: mode === 'production',
            rollupOptions: { output: { manualChunks: undefined } },
        },
    }),
);
