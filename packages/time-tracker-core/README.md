# @personal/time-tracker-core

Time Tracker core library — domain logic, types, and Svelte 5 UI components.

## 설치

이 패키지는 모노레포 내부 전용입니다. 소비 패키지의 `package.json`에 `workspace:*`로 추가합니다.

```json
{
    "dependencies": {
        "@personal/time-tracker-core": "workspace:*"
    }
}
```

루트에서 `pnpm install --no-offline` 후, Svelte 5가 `peerDependencies`로 요구되므로 호스트 앱에 `svelte`가 맞는 버전으로 설치되어 있어야 합니다.

**exports**: 패키지 루트 `.`는 `types` / `svelte` / `default` 모두 `./src/index.ts`를 가리킵니다 (소스 진입점).

**런타임 의존성**: `@personal/uikit`, `@vanilla-extract/css`, `sql.js`, `zod` (`package.json`의 `dependencies`와 동일).

## 사용 예제

### `initializeApp` (권장)

스토리지(UoW), 서비스, Svelte 스토어를 한 번에 구성합니다. 기본은 인메모리 저장소입니다.

```typescript
import { initializeApp } from '@personal/time-tracker-core';

const ctx = await initializeApp();
// ctx.services, ctx.stores (timer_store, job_store, toast_store), ctx.uow, ctx.logger

// SQLite + IndexedDB 백엔드 (브라우저)
const ctx_sqlite = await initializeApp({
    storage_mode: 'sqlite',
    sqlite_options: { db_name: 'time-tracker.db' },
});

ctx.dispose();
```

### `createServices` (커스텀 UoW)

이미 `IUnitOfWork`와 로거를 갖고 있을 때 도메인 서비스만 조립합니다.

```typescript
import { createServices, MemoryUnitOfWork, ConsoleLogger } from '@personal/time-tracker-core';

const uow = new MemoryUnitOfWork();
const logger = new ConsoleLogger();
const services = createServices(uow, logger);
// services.history_service, job_service, category_service, timer_service, ...
```

## API 개요

패키지 진입점(`src/index.ts`)은 아래 카테고리를 재노출합니다.

| 카테고리 | 내용 |
| -------- | ---- |
| **앱** | `initializeApp`, `InitializeOptions`, `AppContext` |
| **서비스** | `createServices`, `Services`, Job/Category/Timer/History/Export/필드/타임엔트리 서비스 클래스 |
| **스토어** | `createTimerStore`, `createJobStore`, `createToastStore` 및 관련 타입 (Svelte 5 Runes) |
| **컴포넌트** | Timer, JobList, Toolbar, FullView/InlineView, 필드 UI 등 Svelte 컴포넌트 |
| **어댑터** | 로거, SQLite/메모리 저장소, `StorageManager`, Web Locks, UoW |
| **타입·상수·유틸** | 도메인 타입, Zod 스키마 연동 타입, 공통 상수, 헬퍼 |
| **에러** | 도메인/저장소 계층 에러 타입 |

상세 구조는 [docs/time-tracker/02-architecture.md](../../docs/time-tracker/02-architecture.md)를 참고하세요.

## 스크립트

| 스크립트 | 설명 |
| -------- | ---- |
| `pnpm dev` | Vite 개발 서버 |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm type-check` | `tsc --noEmit` + `svelte-check` |
| `pnpm lint` | ESLint (ts, svelte) |
| `pnpm format` / `pnpm format:check` | Prettier |
| `pnpm test` | Vitest 일회 실행 (`--passWithNoTests`) |
| `pnpm test:watch` | Vitest 워치 |
| `pnpm test:coverage` | 커버리지 포함 Vitest |

## 프로젝트 구조 (`src/`)

```
src/
├── app/              # initializeApp, AppContext
├── adapters/         # logger, storage (memory / sqlite), StorageManager
├── components/       # Svelte UI (Timer, JobList, Toolbar, …)
├── constants/
├── errors/
├── services/         # createServices, 도메인 서비스
├── stores/           # timer / job / toast Svelte stores
├── types/
├── ui/               # 필드 렌더러 등 공용 UI
├── utils/
├── __tests__/        # unit / component / integration
└── index.ts          # public API
```

## 라이선스

MIT
