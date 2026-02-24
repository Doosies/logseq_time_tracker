import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import tseslint from 'typescript-eslint';
import type { Linter } from 'eslint';

/**
 * 루트 ESLint 설정 (공통 규칙)
 * 각 패키지는 이 설정을 extends하거나 preset 함수를 사용합니다.
 */

// 전역 무시 패턴
const ignores: Linter.FlatConfig = {
    ignores: [
        'dist',
        'build',
        'node_modules',
        'coverage',
        '.history',
        '.turbo',
        '.vite',
        '.cache',
        '**/*.css.ts.vanilla.css',
    ],
};

// 기본 JavaScript/TypeScript 설정
const baseConfig: Linter.FlatConfig[] = [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        rules: {
            // 사용하지 않는 변수 경고 (언더스코어로 시작하는 변수는 제외)
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            // 명시적 any 타입 사용 경고만 (완전 금지 X)
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
];

/**
 * Node.js 패키지용 preset
 * @param tsconfigRootDir - tsconfig.json이 있는 디렉토리 경로
 */
export function createNodeConfig(tsconfigRootDir: string): Linter.FlatConfig[] {
    return [
        ignores,
        ...baseConfig,
        {
            files: ['**/*.ts'],
            ignores: ['*.config.ts'],
            languageOptions: {
                globals: {
                    ...globals.node,
                },
                parserOptions: {
                    project: './tsconfig.json',
                    tsconfigRootDir,
                },
            },
        },
    ];
}

/**
 * Browser 패키지용 preset
 */
export function createBrowserConfig(): Linter.FlatConfig[] {
    return [
        ignores,
        ...baseConfig,
        {
            files: ['**/*.{ts,tsx}'],
            languageOptions: {
                globals: {
                    ...globals.browser,
                },
            },
        },
    ];
}

/**
 * Svelte 패키지용 preset (플러그인 + 파서 + 규칙 포함)
 */
export function createSvelteConfig(
    additionalGlobals?: Record<string, boolean | 'readonly' | 'writable'>,
): Linter.FlatConfig[] {
    return [
        ignores,
        ...baseConfig,
        ...svelte.configs['flat/recommended'],
        {
            files: ['**/*.svelte', '**/*.ts'],
            languageOptions: {
                globals: {
                    ...globals.browser,
                    ...additionalGlobals,
                },
            },
        },
        {
            files: ['**/*.svelte'],
            languageOptions: {
                parserOptions: { parser: tseslint.parser },
            },
            rules: {
                'svelte/no-at-html-tags': 'off',
                'svelte/valid-compile': 'error',
            },
        },
        {
            files: ['**/*.svelte.ts', '**/*.svelte.js'],
            languageOptions: {
                parserOptions: { parser: tseslint.parser },
            },
        },
    ];
}

// 기본 export (루트용)
export default [ignores, ...baseConfig];
