# Phase 1C: 저장소 레이어

## 목표

Repository 인터페이스 9개, IUnitOfWork 인터페이스, MemoryUnitOfWork + Memory\*Repository 구현체를 작성합니다. Phase 1에서는 5개 Repository를 실질 구현하고 나머지 4개는 stub으로 제공합니다.

---

## 선행 조건

- Phase 1B 완료 — 도메인 타입, 에러 클래스 정의됨

---

## 참조 설계 문서

| 문서                 | 섹션                          | 참조 내용                                            |
| -------------------- | ----------------------------- | ---------------------------------------------------- |
| `05-storage.md`      | §Repository 인터페이스        | 9개 Repository 전체 시그니처                         |
| `05-storage.md`      | §IUnitOfWork                  | transaction() + 9개 readonly repo 프로퍼티           |
| `05-storage.md`      | §MemoryUnitOfWork             | Map 기반, structuredClone, 스냅샷 롤백               |
| `05-storage.md`      | §Phase별 인터페이스 구현 범위 | Phase 1: job, category, timeEntry, history, settings |
| `05-storage.md`      | §진행 중 타이머 영속화        | ActiveTimerState 저장/조회                           |
| `05-storage.md`      | §TimeEntryFilter 시맨틱       | from_date/to_date는 started_at 기준 inclusive        |
| `02-architecture.md` | §4.2 Adapters                 | ISettingsAdapter (logseq 전용), ILogger              |
| `02-architecture.md` | §13 Repository 저장 규칙      | structuredClone 입출력, Plain Object 전용            |
| `02-architecture.md` | §중첩 트랜잭션 전략           | \_active_transaction 플래그, 기존 트랜잭션 조인      |

---

## 생성 파일 목록

모든 파일은 `packages/time-tracker-core/src/` 하위입니다.

### 인터페이스

| 파일                               | 역할                           |
| ---------------------------------- | ------------------------------ |
| `adapters/storage/repositories.ts` | 9개 Repository 인터페이스 전체 |
| `adapters/storage/unit_of_work.ts` | `IUnitOfWork` 인터페이스       |
| `adapters/storage/index.ts`        | barrel re-export               |

### Memory 구현체

| 파일                                                      | 역할                                          |
| --------------------------------------------------------- | --------------------------------------------- |
| `adapters/storage/memory/memory_job_repository.ts`        | `Map<string, Job>` 기반 CRUD                  |
| `adapters/storage/memory/memory_category_repository.ts`   | `Map<string, Category>` 기반 CRUD             |
| `adapters/storage/memory/memory_time_entry_repository.ts` | `Map<string, TimeEntry>` 기반 + 필터링        |
| `adapters/storage/memory/memory_history_repository.ts`    | `Map<string, JobHistory>` 기반 + 기간별 조회  |
| `adapters/storage/memory/memory_settings_repository.ts`   | `Map<string, unknown>` 기반 키-값 저장        |
| `adapters/storage/memory/stubs.ts`                        | Phase 2+ Repository stub (StorageError throw) |
| `adapters/storage/memory/memory_unit_of_work.ts`          | 모든 repo 인스턴스 + transaction + 중첩 조인  |
| `adapters/storage/memory/index.ts`                        | barrel re-export                              |

### Settings Adapter

| 파일                                           | 역할                                        |
| ---------------------------------------------- | ------------------------------------------- |
| `adapters/settings/settings_adapter.ts`        | `ISettingsAdapter` 인터페이스 (logseq 전용) |
| `adapters/settings/memory_settings_adapter.ts` | 메모리 구현 (Phase 1 테스트/프로토타입용)   |
| `adapters/settings/index.ts`                   | barrel re-export                            |

---

## 구현 상세

### Repository 인터페이스 (9개)

```typescript
// adapters/storage/repositories.ts
// 05-storage.md §Repository 인터페이스 전체 시그니처 그대로 정의

export interface IJobRepository {
    getJobs(): Promise<Job[]>;
    getJobById(id: string): Promise<Job | null>;
    getJobsByStatus(status: StatusKind): Promise<Job[]>;
    getActiveJob(): Promise<Job | null>;
    upsertJob(job: Job): Promise<void>;
    updateJobStatus(id: string, status: StatusKind): Promise<void>;
    deleteJob(id: string): Promise<void>;
}

export interface ICategoryRepository {
    /* ... */
}
export interface ITimeEntryRepository {
    /* ... */
}
export interface IHistoryRepository {
    /* ... */
}
export interface IExternalRefRepository {
    /* ... */
}
export interface ISettingsRepository {
    /* ... */
}
export interface ITemplateRepository {
    /* ... */
}
export interface IJobCategoryRepository {
    /* ... */
}
export interface IDataFieldRepository {
    /* ... */
}
```

> 전체 시그니처는 `05-storage.md` §Repository 인터페이스 참조

### IUnitOfWork

```typescript
export interface IUnitOfWork {
    transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;

    readonly jobRepo: IJobRepository;
    readonly categoryRepo: ICategoryRepository;
    readonly timeEntryRepo: ITimeEntryRepository;
    readonly historyRepo: IHistoryRepository;
    readonly externalRefRepo: IExternalRefRepository;
    readonly settingsRepo: ISettingsRepository;
    readonly templateRepo: ITemplateRepository;
    readonly jobCategoryRepo: IJobCategoryRepository;
    readonly dataFieldRepo: IDataFieldRepository;
}
```

### MemoryUnitOfWork 핵심 패턴

```typescript
export class MemoryUnitOfWork implements IUnitOfWork {
    readonly jobRepo = new MemoryJobRepository();
    readonly categoryRepo = new MemoryCategoryRepository();
    readonly timeEntryRepo = new MemoryTimeEntryRepository();
    readonly historyRepo = new MemoryHistoryRepository();
    readonly settingsRepo = new MemorySettingsRepository();
    // Phase 2+ stubs
    readonly externalRefRepo = new StubExternalRefRepository();
    readonly templateRepo = new StubTemplateRepository();
    readonly jobCategoryRepo = new StubJobCategoryRepository();
    readonly dataFieldRepo = new StubDataFieldRepository();

    private _active_transaction = false;

    async transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
        if (this._active_transaction) {
            return fn(this); // 중첩 트랜잭션 조인
        }
        this._active_transaction = true;
        const snapshot = this.createSnapshot();
        try {
            const result = await fn(this);
            return result;
        } catch (e) {
            this.restoreSnapshot(snapshot);
            throw e;
        } finally {
            this._active_transaction = false;
        }
    }
}
```

### Memory Repository 공통 패턴

```typescript
// structuredClone 입출력 — Svelte 5 Proxy 격리
async upsertJob(job: Job): Promise<void> {
  this.jobs.set(job.id, structuredClone(job));
}

async getJobById(id: string): Promise<Job | null> {
  const job = this.jobs.get(id);
  return job ? structuredClone(job) : null;
}
```

### getActiveJob 특수 처리

```typescript
async getActiveJob(): Promise<Job | null> {
  const active = Array.from(this.jobs.values())
    .filter((j) => j.status === 'in_progress');
  if (active.length > 1) {
    console.warn(`불변 조건 위반: in_progress Job ${active.length}개 발견`);
  }
  return active[0] ? structuredClone(active[0]) : null;
}
```

### Stub Repository 패턴

```typescript
export class StubExternalRefRepository implements IExternalRefRepository {
    async getExternalRefs(): Promise<ExternalRef[]> {
        throw new StorageError('Phase 2에서 구현 예정', 'stub');
    }
    // ... 모든 메서드 동일
}
```

---

## 완료 기준

- [x] 9개 Repository 인터페이스 정의 완료
- [x] IUnitOfWork 인터페이스 정의 완료
- [x] 5개 Memory Repository 구현 (job, category, timeEntry, history, settings)
- [x] 4개 Stub Repository 구현 (externalRef, template, jobCategory, dataField)
- [x] MemoryUnitOfWork transaction + 중첩 조인 + 스냅샷 롤백 구현
- [x] structuredClone 입출력 적용
- [x] `pnpm type-check` 성공

---

## 다음 단계

→ Phase 1D: 서비스 레이어 (`1d-services.md`)
