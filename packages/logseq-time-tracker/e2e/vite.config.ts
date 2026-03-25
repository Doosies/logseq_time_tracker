import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    root: path.resolve(import.meta.dirname),
    plugins: [vanillaExtractPlugin(), svelte()],
    server: { port: 5174 },
});
