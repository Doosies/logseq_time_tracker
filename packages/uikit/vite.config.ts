import { createSvelteViteConfig } from '../../config/vite.shared';
import { resolve } from 'path';

export default createSvelteViteConfig({
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
      output: { preserveModules: true, preserveModulesRoot: 'src' },
    },
    minify: 'esbuild',
    cssMinify: true,
  },
});
