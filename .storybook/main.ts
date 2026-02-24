import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.svelte',
    '../packages/*/src/**/*.stories.ts',
  ],
  addons: ['@storybook/addon-svelte-csf'],
  framework: {
    name: '@storybook/svelte-vite',
    options: {},
  },
};

export default config;
