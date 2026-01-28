# Configuration

## TypeScript 설정

`tsconfig.json`에서 TypeScript 컴파일러 옵션을 설정합니다:

```json
{
    "compilerOptions": {
        "target": "ESNext",
        "lib": ["DOM", "DOM.Iterable", "ESNext"],
        "jsx": "react-jsx",
        "strict": true
    }
}
```

## Vite 설정

`vite.config.ts`에서 Vite와 Vitest를 설정합니다:

```ts
export default defineConfig({
    plugins: [logseqDevPlugin(), react()],
    build: {
        target: 'esnext',
        minify: 'esbuild',
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
});
```

## ESLint 설정

`eslint.config.js`에서 린팅 규칙을 설정합니다:

- TypeScript ESLint
- React Hooks 규칙
- Prettier 통합

## Prettier 설정

`.prettierrc`에서 코드 포맷팅 규칙을 설정합니다:

```json
{
    "semi": true,
    "singleQuote": false,
    "tabWidth": 2,
    "trailingComma": "all"
}
```

## Logseq 플러그인 설정

`package.json`의 `logseq` 필드에서 플러그인 메타데이터를 설정합니다:

```json
{
    "logseq": {
        "id": "logseq-plugin-personal",
        "title": "Personal Plugin",
        "icon": "./logo.svg",
        "main": "dist/index.html"
    }
}
```

## Turborepo 설정

`turbo.json`에서 빌드 파이프라인을 설정합니다:

```json
{
    "pipeline": {
        "build": {
            "dependsOn": ["^build"],
            "outputs": ["dist/**"]
        },
        "dev": {
            "cache": false,
            "persistent": true
        }
    }
}
```
