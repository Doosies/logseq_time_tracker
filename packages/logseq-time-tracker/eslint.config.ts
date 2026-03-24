import { createSvelteConfig } from '../../eslint.config.ts';

export default createSvelteConfig({ logseq: 'readonly' }, import.meta.dirname);
