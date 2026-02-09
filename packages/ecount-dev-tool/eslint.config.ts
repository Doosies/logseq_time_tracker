import { createSvelteConfig } from '../../eslint.config.js';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
    ...createSvelteConfig({
        ...globals.webextensions,
    }),

    // Svelte 파일 설정
    ...svelte.configs['flat/recommended'],
    {
        files: ['**/*.svelte'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
        },
        rules: {
            // Svelte 5 Runes 모드에서는 a11y 경고만 표시
            'svelte/no-at-html-tags': 'off',
            'svelte/valid-compile': 'error',
        },
    },
];
