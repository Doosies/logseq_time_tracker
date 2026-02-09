import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * 루트 ESLint 설정 (공통 규칙)
 * 각 패키지는 이 설정을 extends하여 사용합니다.
 */
export default tseslint.config(
    // 전역 무시 패턴
    {
        ignores: [
            'dist',
            'build',
            'node_modules',
            'coverage',
            '.history',
            '.turbo',
            '.vite',
            '**/*.css.ts.vanilla.css',
        ],
    },

    // 기본 JavaScript/TypeScript 설정
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
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
);
