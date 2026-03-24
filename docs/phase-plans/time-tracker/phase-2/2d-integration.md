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
| `adapters/storage/sqlite/index.ts` | SQLite 어댑터 barrel export (`SqliteUnitOfWork` 등) | 변경 |
| `adapters/storage/index.ts` | storage adapter 전체 export 정리 | 변경 |
| `app/initialize.ts` (기존 `initializeApp` 위치) | `storage_mode` / `uow` / `sqlite_options`에 따른 UoW 선택 및 마이그레이션 실행 | 변경 |

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

### 2. initializeApp 수정

앱 진입점에서 UoW를 조립합니다. 우선순위: **명시적 `uow` 주입** → **`storage_mode === 'sqlite'`** → **그 외(기본 메모리 또는 명시 `memory`)**.

```typescript
interface InitializeOptions {
  uow?: IUnitOfWork;
  storage_mode?: 'memory' | 'sqlite';
  sqlite_options?: SqliteAdapterOptions;
  logger?: ILogger;
}

async function initializeApp(options: InitializeOptions = {}) {
  let uow: IUnitOfWork;

  if (options.uow) {
    uow = options.uow;
  } else if (options.storage_mode === 'sqlite') {
    const adapter = new SqliteAdapter();
    await adapter.initialize(options.sqlite_options!);
    const runner = new MigrationRunner(adapter.getDatabase(), ALL_MIGRATIONS);
    await runner.run();
    uow = new SqliteUnitOfWork(adapter);
  } else {
    uow = new MemoryUnitOfWork();
  }

  const services = createServices(uow, options.logger);
  // ... store 초기화, 시드 데이터, ActiveTimerState 복구 등 (Phase 1G 시퀀스 유지)
}
```

- **기본값**: Phase 2 이후 프로덕션 경로에서는 `storage_mode` 기본을 `'sqlite'`로 두는 것을 권장합니다(플러그인 `main.ts`에서 생략 시 SQLite).
- **테스트 / CI**: `storage_mode: 'memory'` 또는 테스트 더블·`MemoryUnitOfWork`를 `uow`로 직접 주입하여 I/O·WASM 의존을 제거합니다.
- **SQLite 초기화 실패**: `adapter.initialize` 또는 마이그레이션 실패 시 사용자 알림·폴백은 **Phase 2E (Storage Fallback & Web Locks)** 에서 다룹니다. 본 Phase에서는 UoW 선택 분기와 성공 경로를 명확히 하는 것이 범위입니다.

`createServices(uow, logger)` 호출 이후 단계(카테고리 시드, 타이머 복구, job 스토어 로드 등)는 `1g-app-integration.md`의 5단계 시퀀스를 그대로 따르되, `uow` 구현체만 바뀝니다.

---

### 3. createStorageAdapter 팩토리 (선택)

`initializeApp` 내부 분기가 길어지면, UoW 생성만 별도 함수로 추출합니다.

```typescript
async function createStorageAdapter(
  mode: 'sqlite' | 'memory',
  options?: SqliteAdapterOptions,
): Promise<IUnitOfWork> {
  if (mode === 'sqlite') {
    const adapter = new SqliteAdapter();
    await adapter.initialize(options!);
    const runner = new MigrationRunner(adapter.getDatabase(), ALL_MIGRATIONS);
    await runner.run();
    return new SqliteUnitOfWork(adapter);
  }
  return new MemoryUnitOfWork();
}
```

`initializeApp`에서는 `createStorageAdapter(options.storage_mode ?? 'sqlite', options.sqlite_options)` 형태로 호출할 수 있습니다. **필수는 아니며**, 가독성·단일 책임 분리가 필요할 때 도입합니다.

---

## 완료 기준

- [ ] `SqliteUnitOfWork` 구현 (`BEGIN` / `COMMIT` / `ROLLBACK`)
- [ ] 중첩 트랜잭션 조인 동작 (`_active_transaction` 플래그)
- [ ] 9개 Repository 인스턴스가 `SqliteUnitOfWork`에 포함
- [ ] `COMMIT` 후 `persist()` 호출 (DB 바이너리 → OPFS/IndexedDB)
- [ ] `initializeApp`에서 `storage_mode`에 따라 UoW 선택
- [ ] 기존 `MemoryUnitOfWork` 경로 호환성 유지 (`uow` 주입·`memory` 모드)
- [ ] 마이그레이션 실행 후 `SqliteUnitOfWork` 생성

---

## 다음 단계

→ Phase 2E: Storage Fallback & Web Locks
