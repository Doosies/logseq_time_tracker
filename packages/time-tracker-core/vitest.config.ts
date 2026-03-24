import { createSvelteVitestConfig } from '../../config/vitest.shared';

export default createSvelteVitestConfig({
    test: { setupFiles: ['src/test/setup.ts'] },
});
