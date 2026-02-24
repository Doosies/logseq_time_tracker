import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { resolve } from 'path';

export default defineConfig({
  plugins: [svelte({ hot: false }), vanillaExtractPlugin()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
    conditions: ['browser'],
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.svelte.test.ts'],
    setupFiles: ['src/test/setup.ts'],
    globals: true,
  },
});
