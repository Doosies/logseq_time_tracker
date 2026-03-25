import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e/tests',
    timeout: 30_000,
    retries: 0,
    use: {
        baseURL: 'http://localhost:5174',
        headless: true,
    },
    webServer: {
        command: 'npx vite --config e2e/vite.config.ts --port 5174',
        port: 5174,
        reuseExistingServer: !process.env['CI'],
    },
});
