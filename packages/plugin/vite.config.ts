import react from '@vitejs/plugin-react';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';

const require = createRequire(import.meta.url);
const logseqDevPlugin = require('vite-plugin-logseq').default;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [
        // 테스트 모드에서는 logseqDevPlugin 비활성화
        ...(mode !== 'test' ? [logseqDevPlugin()] : []),
        vanillaExtractPlugin(),
        react(),
    ],
    build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: true,
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './tests/setup.ts',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['node_modules/', 'tests/', 'dist/', '*.config.ts', '*.config.js', '*.css.ts'],
        },
    },
}));
