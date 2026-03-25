import { createSvelteConfig } from '../../eslint.config.ts';

export default [{ ignores: ['e2e/dist/**'] }, ...createSvelteConfig({ logseq: 'readonly' }, import.meta.dirname)];
