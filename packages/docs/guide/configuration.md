# Configuration

## TypeScript 설정

루트 `tsconfig.base.json`에서 공통 설정을 관리하고 각 패키지가 이를 상속합니다.

### UIKit (Svelte)

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "target": "ESNext",
        "lib": ["DOM", "DOM.Iterable", "ESNext"]
    }
}
```

### Ecount Dev Tool (Svelte + Chrome)

```json
{
    "extends": "../../tsconfig.base.json",
    "compilerOptions": {
        "types": ["chrome"]
    }
}
```

## ESLint 설정

루트 `eslint.config.ts`에서 Svelte + TypeScript 규칙을 통합 관리합니다:

```typescript
import { createSvelteConfig } from '../../eslint.config.ts';

// 각 패키지에서 tsconfigRootDir 전달
export default createSvelteConfig(undefined, import.meta.dirname);
```

## Vite 설정

UIKit과 Ecount Dev Tool은 Vite를 빌드 도구로 사용합니다.

### UIKit

vanilla-extract 플러그인을 포함하여 CSS-in-TypeScript 스타일링을 처리합니다.

### Ecount Dev Tool

`vite-plugin-web-extension`을 사용하여 Chrome Extension manifest를 처리합니다.

## Storybook 설정

`.storybook/` 디렉토리에서 전역 설정을 관리합니다:

- `main.ts`: 애드온 목록 (`addon-docs`, `addon-a11y`)
- `preview.ts`: 글로벌 autodocs, a11y 파라미터

```bash
pnpm storybook
```

## Prettier 설정

`prettier-plugin-svelte`를 사용하여 Svelte 파일을 포맷합니다.

```bash
pnpm format
```

## Turborepo 설정

`turbo.json`에서 빌드 파이프라인을 정의합니다:

```json
{
    "tasks": {
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
