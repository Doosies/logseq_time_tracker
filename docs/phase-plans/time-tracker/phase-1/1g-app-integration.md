# Phase 1G: 앱 통합

## 목표

time-tracker-core의 초기화 로직, public API export를 정리하고, logseq-time-tracker에서 Logseq 플러그인 진입점을 구현하여 실제 동작하는 앱으로 통합합니다.

---

## 선행 조건

- Phase 1F 완료 — UI 컴포넌트 구현됨
- Phase 1A~1F 모든 산출물이 존재

---

## 참조 설계 문서

| 문서                     | 섹션                   | 참조 내용                              |
| ------------------------ | ---------------------- | -------------------------------------- |
| `04-state-management.md` | §앱 초기화 순서        | 5단계 초기화 시퀀스                    |
| `02-architecture.md`     | §8 서비스 초기화       | createServices 팩토리, 의존성 순서     |
| `02-architecture.md`     | §10 Logseq 통신        | logseq.ready(), UI 마운트, 커맨드 등록 |
| `02-architecture.md`     | §14 dispose 패턴       | IDisposable, TimerService cleanup      |
| `04-state-management.md` | §앱 재시작 시 복구     | ActiveTimerState → timer_store 복구    |
| `05-storage.md`          | §진행 중 타이머 영속화 | beforeunload 경고, sessionStorage 백업 |
| `00-overview.md`         | §3.1~3.2               | 패키지 public API 범위                 |

---

## 초기화 시퀀스 (5단계)

```
1. StorageAdapter 초기화
   └─ Phase 1: MemoryUnitOfWork 직접 생성
   └─ Phase 2: SqliteAdapter → 실패 시 MemoryAdapter 폴백

2. createServices(uow, logger) 호출
   └─ historyService → jobService → timerService, categoryService

3. CategoryService.seedDefaults()
   └─ 기본 카테고리 4개 (멱등)

4. ActiveTimerState 복구
   └─ settingsRepo.get('active_timer') → timer_store.restore()
   └─ 실패 시 ActiveTimerState 삭제 + 경고 로그

5. UI 마운트
   └─ App.svelte 렌더링
   └─ job_store 초기 데이터 로드 (JobService.getJobs)
```

---

## 생성 파일 목록

### `packages/time-tracker-core/src/`

| 파일                | 역할                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------- |
| `app/initialize.ts` | `initializeApp()` — 5단계 초기화 함수                                                    |
| `app/context.ts`    | AppContext 타입 (services + stores + uow 래핑)                                           |
| `index.ts`          | public API barrel export (types, errors, constants, utils, services, stores, components) |

### `packages/logseq-time-tracker/src/`

| 파일         | 역할                                                      |
| ------------ | --------------------------------------------------------- |
| `main.ts`    | Logseq 플러그인 진입점 (`logseq.ready()` + initializeApp) |
| `App.svelte` | 루트 컴포넌트 (Timer + JobList + Toast 조합)              |
| `App.css.ts` | App 레이아웃 스타일                                       |

---

## 구현 상세

### initializeApp()

```typescript
export async function initializeApp(options?: { logger?: ILogger }): Promise<AppContext> {
    const logger = options?.logger ?? new ConsoleLogger();

    // 1. Storage
    const uow = new MemoryUnitOfWork();

    // 2. Services
    const services = createServices(uow, logger);

    // 3. Stores
    const timer_store = createTimerStore();
    const job_store = createJobStore();
    const toast_store = createToastStore();

    // 4. Category seed
    await services.category_service.seedDefaults();

    // 5. Timer 복구
    try {
        const saved = await uow.settingsRepo.get<ActiveTimerState>('active_timer');
        if (saved) {
            const job = await uow.jobRepo.getJobById(saved.job_id);
            const category = await uow.categoryRepo.getCategoryById(saved.category_id);
            if (job && category) {
                timer_store.restore(saved);
            } else {
                await uow.settingsRepo.delete('active_timer');
                logger.warn('ActiveTimerState 복구 실패: 참조 무결성 오류');
            }
        }
    } catch (e) {
        logger.error('ActiveTimerState 복구 중 오류', { error: e });
    }

    // 6. Job 목록 로드
    const jobs = await services.job_service.getJobs();
    job_store.setJobs(jobs);

    return { services, stores: { timer_store, job_store, toast_store }, uow, logger };
}
```

### AppContext

```typescript
export interface AppContext {
    services: ReturnType<typeof createServices>;
    stores: {
        timer_store: ReturnType<typeof createTimerStore>;
        job_store: ReturnType<typeof createJobStore>;
        toast_store: ReturnType<typeof createToastStore>;
    };
    uow: IUnitOfWork;
    logger: ILogger;
}
```

### logseq-time-tracker main.ts

```typescript
import '@logseq/libs';
import App from './App.svelte';
import { initializeApp, ConsoleLogger } from '@personal/time-tracker-core';

async function main() {
    const ctx = await initializeApp({
        logger: new ConsoleLogger(),
    });

    const app = new App({
        target: document.getElementById('app')!,
        props: { ctx },
    });

    logseq.on('ui:visible:changed', ({ visible }) => {
        if (visible) {
            // 필요 시 Job 목록 리프레시
        }
    });
}

logseq.ready(main).catch(console.error);
```

### App.svelte

```svelte
<script lang="ts">
    import type { AppContext } from '@personal/time-tracker-core';
    import { Timer, JobList, ToastContainer, EmptyState } from '@personal/time-tracker-core';

    interface Props {
        ctx: AppContext;
    }
    let { ctx }: Props = $props();

    const { services, stores } = ctx;
    const { timer_store, job_store, toast_store } = stores;
</script>

<main class={styles.app}>
    <Timer {timer_store} {job_store} {services} {toast_store} />

    {#if job_store.state.jobs.length === 0}
        <EmptyState />
    {:else}
        <JobList {job_store} {timer_store} {services} {toast_store} />
    {/if}

    <ToastContainer {toast_store} />
</main>
```

### dispose / beforeunload

```typescript
window.addEventListener('beforeunload', () => {
    ctx.services.timer_service.dispose();
});
```

### public API (time-tracker-core/src/index.ts)

```typescript
// Types
export * from './types';
// Errors
export * from './errors';
// Constants
export * from './constants';
// Utils
export * from './utils';
// Adapters
export * from './adapters/storage';
export * from './adapters/settings';
export * from './adapters/logger';
// Services
export * from './services';
// Stores
export * from './stores';
// Components
export { default as Timer } from './components/Timer.svelte';
export { default as TimerDisplay } from './components/TimerDisplay.svelte';
export { default as TimerButton } from './components/TimerButton.svelte';
export { default as JobList } from './components/JobList.svelte';
export { default as ReasonModal } from './components/ReasonModal.svelte';
export { default as ToastContainer } from './components/ToastContainer.svelte';
export { default as EmptyState } from './components/EmptyState.svelte';
// App
export { initializeApp } from './app/initialize';
export type { AppContext } from './app/context';
```

---

## 완료 기준

- [x] initializeApp() 5단계 시퀀스 구현
- [x] ActiveTimerState 복구 + 참조 무결성 검증
- [x] Logseq 플러그인 진입점 (main.ts + logseq.ready)
- [x] App.svelte 루트 컴포넌트 조합
- [x] public API export 정리 (index.ts)
- [x] dispose + beforeunload 처리
- [x] `pnpm build` 성공 (두 패키지 모두)
- [x] Logseq dev mode에서 플러그인 로드 + 기본 UI 렌더링 확인

---

## 다음 단계

→ Phase 1H: 테스트 (`1h-tests.md`)
