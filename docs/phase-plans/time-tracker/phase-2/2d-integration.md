# Phase 2D: SQLite UnitOfWork 및 앱 통합

## 목표

`SqliteUnitOfWork`를 구현하여 SQLite 네이티브 트랜잭션(`BEGIN` / `COMMIT` / `ROLLBACK`)을 제공하고, 중첩 `transaction()` 호출은 기존 트랜잭션에 조인(join)합니다. `initializeApp`에서 `storage_mode`(또는 주입된 `IUnitOfWork`)에 따라 `MemoryUnitOfWork`와 `SqliteUnitOfWork`를 선택하고, Phase 2C에서 완성한 9개 SQLite Repository를 단일 UoW에서 일관되게 노출합니다.

---

## 선행 조건

- Phase 2C 완료 — 9개 SQLite Repository 구현 및 검증 완료

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `05-storage.md` | §트랜잭션 처리 | `SqliteUnitOfWork`: `BEGIN TRANSACTION` / `COMMIT`, 실패 시 `ROLLBACK` |
| `02-architecture.md` | §4.2 Adapters (중첩 트랜잭션) | `_active_transaction` 플래그, 조인 전략 (`fn(this)` 직접 실행) |
| `02-architecture.md` | §8 서비스 초기화 | `createServices(uow, logger)`, 초기화 순서·팩토리 확장 규칙 |
| `05-storage.md` | §의존성 주입 | `createServices`와 UoW 주입 관계, `02-architecture.md` §8 교차 참조 |

---

## 생성/변경 파일 목록

`packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `adapters/storage/sqlite/sqlite_unit_of_work.ts` | `SqliteUnitOfWork` 구현 (`IUnitOfWork`, 9개 repo 필드, `transaction`) | 신규 |
| `adapters/storage/storage_manager.ts` | SQLite 초기화, 메모리 폴백, `tryRecover` 복구 조율 | 신규 |
| `adapters/storage/exponential_backoff.ts` | SQLite 초기화 등 재시도용 지수 백오프 유틸리티 (`runWithExponentialBackoff`) | 신규 |
| `adapters/storage/storage_state.ts` | `sqlite` / `memory_fallback` 상태 머신 및 구독 알림 | 신규 |
| `adapters/storage/web_locks.ts` | Web Locks API 래퍼 (`ifAvailable`, 타임아웃, 미지원 시 graceful degradation) | 신규 |
| `adapters/storage/sqlite/index.ts` | SQLite 어댑터 barrel export (`SqliteUnitOfWork` 등) | 변경 |
| `adapters/storage/index.ts` | storage adapter 전체 export 정리 | 변경 |
| `app/initialize.ts` (기존 `initializeApp` 위치) | `createUnitOfWork`: `uow`·`storage_mode`·`sqlite_options`·`sqlite_backend`·`web_locks`; sqlite 시 `StorageManager`로 초기화·마이그레이션 | 변경 |

---

## 상세 구현 내용

### 1. SqliteUnitOfWork

`IUnitOfWork` 계약을 만족하는 SQLite 구현체입니다. 생성자에서 동일 `Database` 핸들을 공유하는 9개 `Sqlite*Repository` 인스턴스를 구성합니다.

```typescript
class SqliteUnitOfWork implements IUnitOfWork {
  private _active_transaction = false;

  readonly jobRepo: SqliteJobRepository;
  readonly categoryRepo: SqliteCategoryRepository;
  readonly timeEntryRepo: SqliteTimeEntryRepository;
  readonly historyRepo: SqliteHistoryRepository;
  readonly externalRefRepo: SqliteExternalRefRepository;
  readonly settingsRepo: SqliteSettingsRepository;
  readonly templateRepo: SqliteTemplateRepository;
  readonly jobCategoryRepo: SqliteJobCategoryRepository;
  readonly dataFieldRepo: SqliteDataFieldRepository;

  constructor(private adapter: SqliteAdapter) {
    const db = adapter.getDatabase();
    this.jobRepo = new SqliteJobRepository(db);
    // ... 나머지 Repository 동일 패턴으로 주입
  }

  async transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    if (this._active_transaction) {
      // 중첩 트랜잭션: 기존에 조인 (새 트랜잭션 열지 않음)
      return fn(this);
    }

    const db = this.adapter.getDatabase();
    this._active_transaction = true;
    db.run('BEGIN TRANSACTION');
    try {
      const result = await fn(this);
      db.run('COMMIT');
      await this.adapter.persist(); // DB → OPFS/IndexedDB 저장
      return result;
    } catch (e) {
      db.run('ROLLBACK');
      throw e;
    } finally {
      this._active_transaction = false;
    }
  }
}
```

**중첩 트랜잭션 조인**: `_active_transaction`이 이미 `true`이면 `BEGIN`을 호출하지 않고 `fn(this)`만 실행합니다. `TimerService`가 `uow.transaction()` 안에서 `JobService.switchJob()` 등을 호출할 때 내부 `transaction()`이 동일 규칙으로 조인됩니다 (`02-architecture.md` §4.2와 일치).

**persist 타이밍**: 성공 경로에서 `COMMIT` 직후 `adapter.persist()`를 호출하여 메모리 내 DB 바이너리를 OPFS/IndexedDB에 반영합니다. `persist()`가 실패하면 예외 처리 정책은 구현 시 결정하되, **설계 의도**는 “디스크 반영 실패가 있어도 이후 주기적·다음 성공 시점의 `persist`로 재시도 가능한 구조”를 허용하는 것입니다(Phase 2E에서 락·폴백과 함께 다듬을 수 있음).

**ROLLBACK과 persist**: 롤백 후에는 `persist`를 호출하지 않습니다. 디스크 상 이전 스냅샷과의 정합성은 다음 성공 `COMMIT`+`persist`에서 맞춥니다.

---

### 2. StorageManager 및 보조 모듈

앱 통합 시 SQLite 경로는 `initializeApp`에서 **`StorageManager`**(`adapters/storage/storage_manager.ts`)로 묶을 수 있습니다. 설계 문서 초안의 “폴백은 Phase 2E” 서술과 별개로, 구현에서는 다음 모듈이 한 흐름을 담당합니다.

- **`StorageManager`**
  - `initialize()`: 선택적 `WebLocksManager`로 락 획득 시도 후, 지수 백오프로 `SqliteAdapter` 생성·`initialize`·`MigrationRunner.run()`을 수행합니다. 실패 시 `MemoryUnitOfWork`로 전환하고 `StorageStateMachine`을 `memory_fallback`으로 둡니다.
  - `getUnitOfWork()` / `getStorageState()` / `subscribe()`: 현재 UoW와 스토리지 모드·폴백 사유를 노출합니다.
  - `tryRecover()`: 폴백 중일 때 SQLite를 다시 열고, 메모리에 쌓인 Category/Job/TimeEntry/History/일부 Settings를 FK 순서에 맞춰 한 트랜잭션으로 SQLite에 병합한 뒤 SQLite 모드로 복귀합니다.
  - `dispose()`: Web Lock 해제, SQLite `close`, 리스너 정리.
- **`exponential_backoff.ts`**: `runWithExponentialBackoff(options, operation)` — 기본 `max_attempts: 3`, `base_delay_ms: 50`, 실패 시 지연 `base_delay_ms * 2^attempt`(테스트용 `sleep` 주입 가능).
- **`storage_state.ts`**: `StorageStateMachine`이 `sqlite` ↔ `memory_fallback` 전환과 `fallback_reason` / `fallback_since` 스냅샷을 구독자에게 전달합니다.
- **`web_locks.ts`**: `WebLocksManager`가 `navigator.locks.request(..., { ifAvailable: true, signal })`로 배타 락을 시도하고, `LOCK_TIMEOUT_MS`(기본 5초) 후 `AbortSignal`로 포기합니다. API 미지원 시에는 락 없이 진행합니다.

---

### 3. initializeApp 수정

앱 진입점에서 UoW를 조립합니다. 우선순위: **명시적 `uow` 주입** → **`storage_mode === 'sqlite'`** → **그 외(기본 메모리 또는 명시 `memory`)**.

```typescript
interface InitializeOptions {
  logger?: ILogger;
  uow?: IUnitOfWork;
  storage_mode?: 'memory' | 'sqlite';
  sqlite_options?: SqliteAdapterOptions;
  /** 테스트·커스텀 영속화: 생략 시 sqlite 모드에서 IndexedDbBackend(db_name 기본 `time-tracker.db`) */
  sqlite_backend?: IStorageBackend;
  /** StorageManager 초기화 시 Web Locks 래퍼(선택) */
  web_locks?: WebLocksManager;
}

async function createUnitOfWork(
  options: InitializeOptions,
): Promise<{ uow: IUnitOfWork; storage_manager?: StorageManager }> {
  if (options.uow !== undefined) {
    return { uow: options.uow };
  }
  if (options.storage_mode === 'sqlite') {
    const sqlite_opts = options.sqlite_options ?? {};
    const backend = options.sqlite_backend ?? new IndexedDbBackend(sqlite_opts.db_name ?? 'time-tracker.db');
    const storage_manager = new StorageManager({
      sqlite_options: sqlite_opts,
      backend,
      logger: options.logger,
      web_locks: options.web_locks,
    });
    const uow = await storage_manager.initialize();
    return { uow, storage_manager };
  }
  return { uow: new MemoryUnitOfWork() };
}

async function initializeApp(options: InitializeOptions = {}) {
  const { uow, storage_manager } = await createUnitOfWork(options);
  const services = createServices(uow, options.logger);
  // ... store 초기화, 시드 데이터, ActiveTimerState 복구 등 (Phase 1G 시퀀스 유지)
  // AppContext에 storage_manager가 있으면 노출(구독·복구 UI 연동용)
}
```

- **SQLite 경로**: `SqliteAdapter` 생성·`initialize`·`MigrationRunner.run()`(동기)·`SqliteUnitOfWork` 조립은 **`StorageManager`** 내부에서 수행됩니다. 지수 백오프 재시도·초기화 실패 시 Memory 폴백도 여기서 처리합니다(`storage_manager.ts`).
- **기본값**: Phase 2 이후 프로덕션 경로에서는 `storage_mode` 기본을 `'sqlite'`로 두는 것을 권장합니다(플러그인 `main.ts`에서 생략 시 SQLite).
- **테스트 / CI**: `storage_mode: 'memory'`, `uow` 직접 주입, 또는 `sqlite_backend`로 I/O를 교체합니다. `retry_options`는 `StorageManagerOptions`에 있으나 `initializeApp`의 `InitializeOptions`에는 현재 노출되지 않으므로, 백오프를 바꿔 테스트하려면 `StorageManager`를 직접 조립하는 경로를 씁니다.
- **사용자 알림·읽기 전용 모드** 등 나머지는 **Phase 2E** 문서의 미완 항목과 설계(`05-storage.md`)를 따릅니다.

`createServices(uow, logger)` 호출 이후 단계(카테고리 시드, 타이머 복구, job 스토어 로드 등)는 `1g-app-integration.md`의 5단계 시퀀스를 그대로 따르되, `uow` 구현체만 바뀝니다.

---

### 4. 팩토리 분리

별도 `createStorageAdapter` 팩토리는 두지 않고, **`createUnitOfWork`**(`initialize.ts`) 한 곳에서 `uow` 주입 → sqlite → memory 순으로 분기합니다.

---

## 완료 기준

- [x] `SqliteUnitOfWork` 구현 (`BEGIN` / `COMMIT` / `ROLLBACK`)
- [x] 중첩 트랜잭션 조인 동작 (`_active_transaction` 플래그)
- [x] 9개 Repository 인스턴스가 `SqliteUnitOfWork`에 포함
- [x] `COMMIT` 후 `persist()` 호출 (DB 바이너리 → OPFS/IndexedDB)
- [x] `initializeApp`에서 `createUnitOfWork`로 `storage_mode`·`sqlite_backend`·`web_locks` 반영
- [x] 기존 `MemoryUnitOfWork` 경로 호환성 유지 (`uow` 주입·`memory` 모드)
- [x] 마이그레이션 실행 후 `SqliteUnitOfWork` 생성 (`StorageManager` 경로)

---

## 다음 단계

→ Phase 2E: Storage Fallback & Web Locks
