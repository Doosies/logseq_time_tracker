import { createSvelteConfig } from '../../eslint.config.ts';
import globals from 'globals';

export default [...createSvelteConfig({ ...globals.webextensions }), { ignores: ['src/old/**'] }];
