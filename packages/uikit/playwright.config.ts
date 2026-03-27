import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: 'http://localhost:6007',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npx http-server ../../storybook-static -p 6007 --silent',
    port: 6007,
    reuseExistingServer: !process.env['CI'],
  },
});
