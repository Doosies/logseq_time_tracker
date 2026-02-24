import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

const base_config = defineConfig({
  plugins: [svelte(), vanillaExtractPlugin()],
  build: {
    target: 'esnext',
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['svelte'],
  },
});

export function createSvelteViteConfig(overrides?: UserConfig) {
  return overrides
    ? mergeConfig(base_config, overrides)
    : base_config;
}
