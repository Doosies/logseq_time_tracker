# Phase 1A: 패키지 인프라

## 목표

기존 `packages/time-tracker`(React) 삭제 후, 설계에 따라 `time-tracker-core`(Svelte 5 코어) + `logseq-time-tracker`(Logseq 플러그인) 2개 패키지를 생성합니다.

---

## 선행 조건

- Phase 0 (PoC) 통과 — vanilla-extract + Svelte 5 + Logseq iframe 호환 확인
- 모노레포 환경 정상 동작 (pnpm workspace + turbo)

---

## 참조 설계 문서

| 문서                 | 섹션                | 참조 내용                                           |
| -------------------- | ------------------- | --------------------------------------------------- |
| `00-overview.md`     | §3 패키지 분리 구조 | 2개 패키지 역할, 의존성 방향 (Core → Logseq 무의존) |
| `00-overview.md`     | §3.1~3.2            | time-tracker-core / logseq-time-tracker 상세 스펙   |
| `02-architecture.md` | §3.1 디렉토리 구조  | time-tracker-core 전체 폴더 트리                    |
| `02-architecture.md` | §3.2 디렉토리 구조  | logseq-time-tracker 전체 폴더 트리                  |
| `02-architecture.md` | §6 기술 스택        | Svelte 5, vanilla-extract, Vite 7, Vitest           |
| `02-architecture.md` | §7 의존성 그래프    | pnpm workspace 참조 방향                            |

---

## 삭제 대상

| 경로                            | 이유                                  |
| ------------------------------- | ------------------------------------- |
| `packages/time-tracker/` (전체) | React 기반 스캐폴드 → Svelte 5로 전환 |

---

## 생성 파일 목록

### `packages/time-tracker-core/`

| 파일               | 역할                                                         |
| ------------------ | ------------------------------------------------------------ |
| `package.json`     | `@personal/time-tracker-core`, Svelte 5 + VE 의존성, scripts |
| `tsconfig.json`    | `config/tsconfig.svelte.json` 확장, include: src + tests     |
| `vite.config.ts`   | `createSvelteViteConfig()` + library mode (es format)        |
| `svelte.config.js` | 공유 설정 재사용 (`config/svelte.config.shared.js`)          |
| `eslint.config.js` | ESLint + Svelte 플러그인 설정                                |
| `src/index.ts`     | public API barrel export (초기에는 빈 export)                |

### `packages/logseq-time-tracker/`

| 파일               | 역할                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `package.json`     | `@personal/logseq-time-tracker`, core workspace 의존, @logseq/libs |
| `tsconfig.json`    | `config/tsconfig.svelte.json` 확장                                 |
| `vite.config.ts`   | Logseq 플러그인 빌드 (index.html → dist/)                          |
| `svelte.config.js` | 공유 설정 재사용                                                   |
| `eslint.config.js` | ESLint 설정                                                        |
| `index.html`       | Logseq 플러그인 HTML 진입점                                        |
| `logo.svg`         | 기존 time-tracker에서 복사                                         |
| `src/main.ts`      | 최소 Logseq 플러그인 진입점 (placeholder)                          |
| `src/App.svelte`   | 최소 루트 컴포넌트 (placeholder)                                   |

### 워크스페이스 설정

| 파일                  | 변경 내용                                           |
| --------------------- | --------------------------------------------------- |
| `pnpm-workspace.yaml` | catalog에 `@logseq/libs`, `vite-plugin-logseq` 추가 |

---

## 구현 상세

### time-tracker-core package.json 핵심

```json
{
    "name": "@personal/time-tracker-core",
    "type": "module",
    "exports": { ".": "./src/index.ts" },
    "scripts": {
        "dev": "vite dev",
        "build": "vite build",
        "test": "vitest run --passWithNoTests",
        "type-check": "tsc --noEmit && svelte-check --tsconfig ./tsconfig.json",
        "lint": "eslint . --ext ts,svelte",
        "format": "prettier --write \"src/**/*.{ts,svelte,json,css.ts}\""
    },
    "dependencies": {
        "@vanilla-extract/css": "catalog:"
    },
    "peerDependencies": {
        "svelte": "catalog:"
    }
}
```

### time-tracker-core vite.config.ts 핵심

```typescript
import { createSvelteViteConfig } from '../../config/vite.shared';
import { resolve } from 'path';

export default createSvelteViteConfig({
    build: {
        lib: {
            entry: { index: resolve(__dirname, 'src/index.ts') },
            formats: ['es'],
        },
        rollupOptions: {
            external: ['svelte', 'svelte/internal', '@vanilla-extract/css'],
            output: { preserveModules: true, preserveModulesRoot: 'src' },
        },
    },
});
```

### logseq-time-tracker package.json 핵심

```json
{
    "name": "@personal/logseq-time-tracker",
    "dependencies": {
        "@personal/time-tracker-core": "workspace:*",
        "@logseq/libs": "catalog:"
    },
    "devDependencies": {
        "vite-plugin-logseq": "catalog:"
    },
    "logseq": {
        "id": "logseq-time-tracker",
        "title": "Time Tracker",
        "icon": "./logo.svg",
        "main": "dist/index.html"
    }
}
```

---

## 완료 기준

- [x] `packages/time-tracker/` 삭제 완료
- [x] `pnpm install --no-offline` 성공
- [x] `pnpm build --filter @personal/time-tracker-core` 성공
- [x] `pnpm build --filter @personal/logseq-time-tracker` 성공
- [x] `pnpm type-check` 성공 (두 패키지 모두)
- [x] turbo 의존성 순서 정상 (core → logseq 순 빌드)

---

## 다음 단계

→ Phase 1B: 코어 타입 & 에러 (`1b-core-types.md`)
