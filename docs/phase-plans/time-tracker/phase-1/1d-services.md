# Phase 1D: 서비스 레이어

## 목표

Phase 1 핵심 서비스 4개 (HistoryService, JobService, CategoryService, TimerService) + ILogger/ConsoleLogger + `createServices` 팩토리 함수를 구현합니다.

---

## 선행 조건

- Phase 1C 완료 — Repository 인터페이스 + MemoryUnitOfWork 구현됨

---

## 참조 설계 문서

| 문서                     | 섹션                         | 참조 내용                                                                  |
| ------------------------ | ---------------------------- | -------------------------------------------------------------------------- |
| `02-architecture.md`     | §4.3 Services                | 서비스 목록, 책임, 호출 방향, Cascade 삭제 전략                            |
| `02-architecture.md`     | §4.4 JobService              | IJobService 인터페이스 (createJob, transitionStatus, switchJob, deleteJob) |
| `02-architecture.md`     | §4.5 HistoryService          | IHistoryService 인터페이스 (recordTransition, getJobHistory)               |
| `02-architecture.md`     | §4.8 CategoryService         | ICategoryService 인터페이스 (CRUD, seedDefaults, 순환 검사, 깊이 10)       |
| `02-architecture.md`     | §8 서비스 초기화             | createServices 팩토리, 의존성 순서 규칙                                    |
| `02-architecture.md`     | §11.1 ILogger                | ILogger 인터페이스, 로그 레벨별 기준                                       |
| `02-architecture.md`     | §14 dispose 패턴             | IDisposable, TimerService의 setInterval 정리                               |
| `04-state-management.md` | §TimerService                | start/pause/resume/stop/cancel 인터페이스                                  |
| `04-state-management.md` | §start 시 동작               | no-op guard, 기존 Job paused, TimeEntry 즉시 생성                          |
| `04-state-management.md` | §cancel 시 동작              | 경과 시간 > 0이면 TimeEntry 생성, `[cancelled]` 접두사                     |
| `04-state-management.md` | §stop() 0초 정책             | duration_seconds === 0이면 null 반환                                       |
| `04-state-management.md` | §트랜잭션 내 단일 타임스탬프 | const now = new Date().toISOString() 공유                                  |
| `04-state-management.md` | §자동 전환 시 reason         | 기존 Job: 사용자 reason / 새 Job: 시스템 "작업 전환: {title}"              |
| `05-storage.md`          | §CategoryService Phase 분할  | Phase 1 삭제는 참조 검사 비활성                                            |

---

## 생성 파일 목록

모든 파일은 `packages/time-tracker-core/src/` 하위입니다.

| 파일                           | 역할                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `adapters/logger.ts`           | `ILogger` 인터페이스 + `ConsoleLogger` 구현             |
| `services/history_service.ts`  | 상태 전환 기록 생성, 이력 조회                          |
| `services/job_service.ts`      | Job CRUD, FSM 전환, cascade 삭제                        |
| `services/category_service.ts` | Category CRUD, 시드, 트리 깊이, 순환 검사               |
| `services/timer_service.ts`    | 타이머 시작/정지/일시정지/취소, ActiveTimerState 영속화 |
| `services/index.ts`            | `createServices` 팩토리 + barrel re-export              |

---

## 구현 상세

### 서비스 의존성 순서

```
HistoryService(uow, logger)         — 의존성 없음
         ↑
JobService(uow, history_service, logger) — HistoryService 의존
         ↑
TimerService(uow, job_service, logger)   — JobService 의존

CategoryService(uow, logger)        — 독립 (JobService와 무관)
```

### ILogger + ConsoleLogger

```typescript
export interface ILogger {
    debug(message: string, context?: Record<string, unknown>): void;
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, context?: Record<string, unknown>): void;
}

export class ConsoleLogger implements ILogger {
    debug(msg: string, ctx?: Record<string, unknown>) {
        console.debug(`[DEBUG] ${msg}`, ctx);
    }
    info(msg: string, ctx?: Record<string, unknown>) {
        console.info(`[INFO] ${msg}`, ctx);
    }
    warn(msg: string, ctx?: Record<string, unknown>) {
        console.warn(`[WARN] ${msg}`, ctx);
    }
    error(msg: string, ctx?: Record<string, unknown>) {
        console.error(`[ERROR] ${msg}`, ctx);
    }
}
```

### HistoryService

```typescript
interface IHistoryService {
    recordTransition(job_id: string, from: StatusKind | null, to: StatusKind, reason: string): Promise<void>;
    getJobHistory(job_id: string): Promise<JobHistory[]>;
    getHistoryByPeriod(filter: HistoryFilter): Promise<JobHistory[]>;
}
```

- `recordTransition`: JobHistory 레코드 생성, `occurred_at = now`, `id = generateId()`
- JobService가 호출

### JobService

```typescript
interface IJobService {
    createJob(params: { title: string; description?: string }): Promise<Job>;
    getJobs(filter?: { status?: StatusKind }): Promise<Job[]>;
    getJobById(id: string): Promise<Job | null>;
    updateJob(id: string, updates: Partial<Pick<Job, 'title' | 'description'>>): Promise<Job>;
    deleteJob(id: string): Promise<void>;
    transitionStatus(job_id: string, to_status: StatusKind, reason: string): Promise<void>;
    switchJob(from_job_id: string, to_job_id: string, reason: string): Promise<void>;
}
```

핵심 로직:

- `createJob`: sanitizeText(title) → 새 Job (status: 'pending') → upsertJob
- `transitionStatus`: isValidTransition 검증 → 실패 시 StateTransitionError → historyService.recordTransition → updateJobStatus
- `switchJob`: 기존 Job paused + 새 Job in_progress를 트랜잭션 내에서 원자적 수행
- `deleteJob`: in_progress/paused 상태면 거부 → cascade: timeEntryRepo.deleteByJobId + historyRepo.deleteByJobId + externalRefRepo.deleteByJobId + jobCategoryRepo.deleteByJobId → jobRepo.deleteJob
- 모든 메서드 진입점에서 sanitizeText 적용 (title, description)

### CategoryService

```typescript
interface ICategoryService {
    getCategories(): Promise<Category[]>;
    getCategoryTree(): Promise<CategoryTreeNode[]>;
    createCategory(name: string, parent_id?: string): Promise<Category>;
    updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'sort_order'>>): Promise<Category>;
    deleteCategory(id: string): Promise<void>;
    seedDefaults(): Promise<void>;
}
```

핵심 로직:

- `createCategory`: sanitizeText(name) → 동일 부모 내 이름 유일성 검증 → 트리 깊이 10 제한 → 순환 참조 검사 (visited set)
- `seedDefaults()`: **멱등** — 카테고리 1개 이상 존재하면 스킵. 기본: 개발, 분석, 회의, 기타 (is_active: true, parent_id: null)
- `deleteCategory`: Phase 1에서는 참조 검사 비활성 (MemoryAdapter 휘발성이므로 안전). 하위 카테고리 존재 시 거부

### TimerService

```typescript
interface ITimerService {
    start(job: Job, category: Category, reason?: string): Promise<void>;
    pause(reason: string): Promise<void>;
    resume(reason: string): Promise<void>;
    stop(reason: string): Promise<TimeEntry | null>;
    cancel(reason: string): Promise<TimeEntry | null>;
    getActiveJob(): Job | null;
    dispose(): void;
}
```

핵심 동작 — **start()**:

1. 새 Job이 현재 active_job과 동일 → **no-op** (카테고리만 다르면 category 변경)
2. 기존 active_job 있음 → 기존 Job TimeEntry 생성 (구간: started_at ~ now) + paused 전환
3. 새 Job → in_progress 전환 (시스템 reason: `"작업 전환: {title}"`)
4. timer_store 갱신: accumulated_ms = 0, current_segment_start = now
5. ActiveTimerState 영속화

핵심 동작 — **stop()**:

1. getElapsedMs() → `duration_seconds = Math.floor(ms / 1000)`
2. duration_seconds === 0 → null 반환 (TimeEntry 미생성)
3. duration_seconds > 0 → TimeEntry 생성 + completed 전환
4. timer_store 초기화 + ActiveTimerState 삭제

핵심 동작 — **cancel()**:

1. 경과 시간 > 0 → TimeEntry 생성 (note: `"[cancelled] {reason}"`)
2. cancelled 전환
3. timer_store 초기화 + ActiveTimerState 삭제

**30초 주기 백업**: setInterval로 accumulated_ms 갱신 → dispose()에서 clearInterval

**트랜잭션 내 단일 타임스탬프**: `const now = new Date().toISOString()` 공유

### createServices 팩토리

```typescript
export function createServices(uow: IUnitOfWork, logger?: ILogger) {
    const history_service = new HistoryService(uow, logger);
    const job_service = new JobService(uow, history_service, logger);
    const category_service = new CategoryService(uow, logger);
    const timer_service = new TimerService(uow, job_service, logger);

    return { history_service, job_service, category_service, timer_service };
}
```

---

## 완료 기준

- [ ] 4개 서비스 + ILogger + ConsoleLogger 타입 에러 0개
- [ ] FSM 전환이 VALID_TRANSITIONS와 일치 (JobService.transitionStatus)
- [ ] TimerService.start() no-op guard 구현
- [ ] TimerService.stop() 0초 정책 구현
- [ ] TimerService.cancel() `[cancelled]` 접두사 구현
- [ ] cascade 삭제 경로 (JobService.deleteJob) 구현
- [ ] CategoryService.seedDefaults() 멱등성 구현
- [ ] createServices 의존성 순서 올바름
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ Phase 1E: 스토어 (`1e-stores.md`)
