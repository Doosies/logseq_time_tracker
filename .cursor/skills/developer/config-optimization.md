---
name: config-optimization
description: TypeScript, ESLint, Vite, Prettier 설정 파일 최적화 체크리스트
---

# 설정 파일 최적화 가이드

이 Skill은 프로젝트의 설정 파일들을 최적화할 때 사용하는 체크리스트입니다.

## TypeScript 설정 (tsconfig)

### 모노레포 구조
```
tsconfig.base.json    ← 공통 설정 (루트)
tsconfig.json         ← 루트 (extends base)
packages/*/tsconfig.json ← 패키지별 (extends base)
```

### base 설정 체크리스트
- [ ] `strict: true` 활성화
- [ ] `noUncheckedIndexedAccess: true` (배열/객체 인덱스 안전성)
- [ ] `noPropertyAccessFromIndexSignature: true` (인덱스 시그니처 명확성)
- [ ] `exactOptionalPropertyTypes: true` (선택적 프로퍼티 엄격)
- [ ] `verbatimModuleSyntax: true` (import/export 명확성)
- [ ] `isolatedModules: true` (빌드 도구 호환)
- [ ] `skipLibCheck: true` (빌드 속도)
- [ ] `forceConsistentCasingInFileNames: true` (OS 호환)

### 패키지별 오버라이드가 필요한 경우

#### Svelte 패키지
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "verbatimModuleSyntax": false,
    "jsx": "preserve",
    "types": ["svelte"]
  }
}
```

#### Node.js 패키지
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "esModuleInterop": true,
    "verbatimModuleSyntax": false,
    "noEmit": false,
    "outDir": "./dist",
    "declaration": true
  }
}
```

#### React 패키지
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "types": ["vite/client", "vitest/globals"]
  }
}
```

---

## ESLint 설정

### 모노레포 구조
```
eslint.config.ts       ← 공통 규칙 (루트)
packages/*/eslint.config.ts ← 패키지별 (extends 루트)
```

### 루트 설정 체크리스트
- [ ] `@eslint/js` recommended 사용
- [ ] `typescript-eslint` recommended 사용
- [ ] 공통 ignores 패턴 정의 (node_modules, dist, build)
- [ ] `@typescript-eslint/no-unused-vars` 설정 (argsIgnorePattern: `^_`)
- [ ] `@typescript-eslint/no-explicit-any` warn 레벨

### 패키지별 확장
- [ ] Svelte 패키지: `eslint-plugin-svelte` 추가
- [ ] React 패키지: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` 추가
- [ ] Chrome Extension: `globals.webextensions`, `chrome: 'readonly'` 추가

### 모노레포에서 tsconfigRootDir

모노레포에서 패키지별 ESLint가 올바른 `tsconfig.json`을 참조하려면, `tsconfigRootDir`를 **각 패키지 디렉토리 기준**으로 설정해야 합니다.

```typescript
// packages/uikit/eslint.config.ts
export default createSvelteConfig({
  tsconfigRootDir: import.meta.dirname,  // 이 패키지 루트 기준
});
```

루트 `__dirname`이 아닌 **각 패키지의 `import.meta.dirname`** 을 사용합니다. 루트 기준으로 설정하면 `Parsing error: No tsconfigRootDir was set` 또는 잘못된 tsconfig 참조 오류가 발생합니다.

### Storybook addon 설정

Storybook 10에서 `addon-essentials`만으로는 docs/a11y가 포함되지 않을 수 있습니다:

- `@storybook/addon-docs`, `@storybook/addon-a11y`를 `pnpm-workspace.yaml` catalog에 추가
- `.storybook/main.ts`의 `addons` 배열에 명시적 등록
- `.storybook/preview.ts`에 `parameters.a11y` 설정
- **버전 호환**: addon 버전은 반드시 core Storybook 메이저 버전과 일치해야 함 (예: Storybook 10.x → addon-docs 10.x)

---

## Vite 설정

### 라이브러리 패키지 (uikit)
```typescript
build: {
  target: 'esnext',
  minify: 'esbuild',
  sourcemap: true,
  lib: { entry, formats: ['es'] },
  rollupOptions: {
    external: [...],
    output: { preserveModules: true }
  }
}
```

### 웹 확장 프로그램 (ecount-dev-tool)
```typescript
build: {
  target: 'esnext',
  minify: 'esbuild',
  sourcemap: false,  // 프로덕션 익스텐션
  cssMinify: true,
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].js',  // 해시 없음 (manifest 참조)
    }
  }
}
```

### 앱 패키지 (time-tracker)
```typescript
build: {
  target: 'esnext',
  minify: 'terser',  // 또는 'esbuild'
  sourcemap: true
}
```

---

## Prettier 설정

### .prettierrc 체크리스트
- [ ] `singleQuote: true`
- [ ] `tabWidth: 2`
- [ ] `semi: true`
- [ ] `trailingComma: "es5"` 또는 `"all"`
- [ ] Svelte 플러그인: `prettier-plugin-svelte`

### .prettierignore 체크리스트
- [ ] `node_modules/`
- [ ] `dist/`, `build/`
- [ ] `.turbo/`, `.vite/`
- [ ] 생성된 파일 (`.d.ts`, `*.css.ts`)
- [ ] `pnpm-lock.yaml`
- [ ] `.cursor/metrics/` (에이전트 시스템)

---

## Turbo 설정

### turbo.json 체크리스트
- [ ] `build` 태스크: `outputs` 정의 (dist, build)
- [ ] `type-check`, `lint`: 의존성 설정 (`dependsOn`)
- [ ] `test`: 캐시 설정
- [ ] 글로벌 의존성: `tsconfig.base.json`, `pnpm-workspace.yaml`

---

## 설정 변경 후 검증 프로세스

```markdown
1. pnpm install --no-offline (lock 파일 갱신)
2. pnpm type-check (타입 검증 - 가장 중요!)
3. pnpm lint (린트 검증)
4. pnpm test (테스트 회귀)
5. pnpm build (빌드 검증 - 빌드 설정 변경 시)
```

---

## 완료 기준

- [ ] 모든 설정 파일이 base에서 상속
- [ ] 패키지별 필요한 오버라이드만 존재
- [ ] 중복 설정 없음
- [ ] type-check + lint + test 모두 통과
