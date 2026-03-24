# Phase 2B: sql.js Adapter & Schema Migration

## 목표

sql.js 초기화, Storage Adapter(OPFS / IndexedDB), Forward-only Migration Runner, Phase 1·2 범위 DDL(`03-data-model.md` §2 시스템 테이블) 구현을 한 번에 완료합니다.

---

## 선행 조건

- Phase 2A(Storage PoC) 검증 완료
- 스토리지 백엔드(primary / fallback) 확정(2A 결정 문서 또는 `2a-storage-poc.md` 갱신 반영)

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
|------|------|------|
| `05-storage.md` | §OPFS + SQLite | sql.js 초기화, OPFS 파일 읽기·쓰기, 바이너리 영속화 흐름 |
| `05-storage.md` | §스키마 마이그레이션 | Forward-only 마이그레이션, `app_settings`에 `schema_version` 저장 |
| `03-data-model.md` | §2 시스템 테이블 | Job, Category, TimeEntry, JobHistory, JobCategory, JobTemplate, ExternalRef 컬럼·제약·FK·인덱스 정책 |
| `02-architecture.md` | §15 스키마 마이그레이션 정책 | Forward-only, 상세는 `05-storage.md`와 정합 |

---

## 생성/변경 파일 목록

`time-tracker-core/src` 기준:

| 파일 | 역할 |
|------|------|
| `adapters/storage/sqlite/sqlite_adapter.ts` | sql.js 초기화, OPFS/IndexedDB 읽기·쓰기 연동, `Database` 인스턴스 관리 |
| `adapters/storage/sqlite/storage_backend.ts` | `IStorageBackend` 인터페이스(DB 바이너리 read/write) |
| `adapters/storage/sqlite/opfs_backend.ts` | OPFS 기반 `IStorageBackend` 구현 |
| `adapters/storage/sqlite/indexeddb_backend.ts` | IndexedDB 기반 `IStorageBackend` 구현 |
| `adapters/storage/sqlite/migration_runner.ts` | Forward-only 마이그레이션 실행기 |
| `adapters/storage/sqlite/migrations/001_initial.ts` | Phase 1 테이블 DDL: `job`, `category`, `time_entry`, `job_history`, `app_settings` |
| `adapters/storage/sqlite/migrations/002_phase2.ts` | Phase 2 테이블 DDL: `external_ref`, `job_category`, `job_template` |
| `adapters/storage/sqlite/migrations/index.ts` | 마이그레이션 배열 export |
| `adapters/storage/sqlite/index.ts` | barrel export |

---

## 상세 구현 내용

### 1. SqliteAdapter

```typescript
interface SqliteAdapterOptions {
  wasm_url: string;  // sql-wasm.wasm 파일 URL
  db_name: string;   // DB 파일명 (기본: 'time-tracker.db')
}

class SqliteAdapter {
  private db: Database | null = null;
  private backend: IStorageBackend;

  async initialize(options: SqliteAdapterOptions): Promise<void>;
  getDatabase(): Database;
  async persist(): Promise<void>;  // db.export() → backend.write()
  async close(): Promise<void>;
}
```

- `initSqlJs({ locateFile: (file) => options.wasm_url })`로 WASM 로드(실제 구현에서는 `locateFile`이 파일명을 받아 해당 WASM URL을 반환하도록 구성).
- `backend.read()`로 기존 DB 바이너리 로드 → `new Database(buffer)`; 없으면(`null`) `new Database()`로 빈 DB 생성.
- 초기화 직후 `PRAGMA journal_mode=WAL;`, `PRAGMA foreign_keys=ON;` 실행.
- `persist()`: `db.export()` → `Uint8Array` → `backend.write(data)`.
- `getDatabase()` 호출 전 `initialize` 완료를 전제로 하며, 미초기화 시 명시적 에러를 권장.
- **초기화 순서(권장)**: 백엔드 생성 → `initialize`(WASM + DB 로드) → `MigrationRunner.run()` → 이후 Repository 계층 사용. 마이그레이션 완료 후 필요 시 `persist()` 호출.

### 2. IStorageBackend

```typescript
interface IStorageBackend {
  read(): Promise<Uint8Array | null>;  // null = DB 없음 (최초)
  write(data: Uint8Array): Promise<void>;
  exists(): Promise<boolean>;
}
```

- Phase 2A에서 확정한 primary 백엔드를 주입하고, 실패 시 상위에서 fallback 백엔드로 교체하는 정책은 `05-storage.md`·2A 결정과 맞출 것.

### 3. OpfsBackend

- `navigator.storage.getDirectory()` → `getFileHandle(db_name, { create: true })`.
- **read**: `handle.getFile()` → `arrayBuffer()` → `new Uint8Array(buf)`.
- **write**: `handle.createWritable()` → `writable.write(data)` → `writable.close()`.
- OPFS 미지원·권한 실패 시 예외를 상위로 전달하여 fallback 선택 가능하게 유지.

### 4. IndexedDbBackend

- DB name: `'time-tracker-storage'`, object store: `'db_files'`.
- Key: `db_name`(예: `'time-tracker.db'`).
- **read**: `transaction('db_files', 'readonly')` → `store.get(key)` → `Uint8Array` 또는 `null`.
- **write**: `transaction('db_files', 'readwrite')` → `store.put(data, key)`.
- DB open 시 `onupgradeneeded`에서 object store 생성(멱등).

### 5. MigrationRunner

```typescript
interface Migration {
  version: number;
  description: string;
  up(db: Database): void;
}

class MigrationRunner {
  constructor(private db: Database, private migrations: Migration[]);

  async run(): Promise<void>;
  getCurrentVersion(): number;
}
```

- `app_settings`에서 `key = 'schema_version'`인 `value`를 읽어 현재 버전으로 사용. 행이 없으면 **버전 0**으로 간주.
- 현재 버전보다 `version`이 큰 마이그레이션만 오름차순 실행.
- 각 마이그레이션은 **개별 트랜잭션**으로 래핑: `BEGIN` → `up(db)` → 성공 시 `COMMIT`, 실패 시 `ROLLBACK` 후 에러 전파로 **앱 시작(또는 어댑터 초기화) 중단**.
- `migrations` 배열은 `migrations/index.ts`에서 버전 순 정렬된 배열로 export.

### 6. DDL — `001_initial.ts` (`03-data-model.md` §2.1~2.4 + 설정)

다음 DDL과 동일하게 구현한다. 컬럼 의미·제약은 `03-data-model.md`와 대응한다.

- **Job** §2.1: `status` 기본값 `pending`, `custom_fields` JSON TEXT, partial unique index로 `in_progress` 1건 제한 §2.1·184행.
- **Category** §2.2: `is_active`는 SQLite에서 `INTEGER NOT NULL DEFAULT 1`(boolean).
- **TimeEntry** §2.3: `job_id`·`category_id` FK, `ON DELETE CASCADE`는 Job 삭제 시 TimeEntry 정리(§2.1 cascade 정책과 정합).
- **JobHistory** §2.4: `from_status`는 NULL 허용(최초 전환), `reason` NOT NULL.
- **app_settings**: `schema_version` 저장용(`05-storage.md` 마이그레이션 절).

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  custom_fields TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_active
  ON job(status) WHERE status = 'in_progress';

CREATE TABLE IF NOT EXISTS category (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES category(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS time_entry (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES category(id),
  started_at TEXT NOT NULL,
  ended_at TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  note TEXT,
  is_manual INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS job_history (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  reason TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
```

- 마이그레이션 완료 시 스키마 버전 1:  
  `INSERT INTO app_settings (key, value) VALUES ('schema_version', '1');`  
  (이미 존재하면 덮어쓰지 않도록 `INSERT OR IGNORE` 또는 선행 조회 후 삽입으로 멱등 처리.)

### 7. DDL — `002_phase2.ts` (`03-data-model.md` §2.5~2.7)

- **ExternalRef** §2.7: `(job_id, system_key)` 유일, Job 삭제 시 CASCADE.
- **JobCategory** §2.5: `(job_id, category_id)` 유일, `is_default`는 DB 제약 없음(서비스 레벨 검증 §2.5·309행).
- **JobTemplate** §2.6: `placeholders`는 JSON TEXT, 파싱 정책은 데이터 모델 §2.6·323행과 동일하게 상위에서 처리.

```sql
CREATE TABLE IF NOT EXISTS external_ref (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  system_key TEXT NOT NULL,
  ref_value TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(job_id, system_key)
);

CREATE TABLE IF NOT EXISTS job_category (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES category(id),
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(job_id, category_id)
);

CREATE TABLE IF NOT EXISTS job_template (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  placeholders TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

- 스키마 버전 2로 갱신:  
  `UPDATE app_settings SET value = '2' WHERE key = 'schema_version';`  
  (버전 1에서 올라오는 경로만 실행되므로, 001에서 `schema_version` 행이 반드시 존재해야 한다.)

---

## 완료 기준

- [ ] sql.js WASM 초기화 및 `Database` 생성 성공
- [ ] OPFS 또는 IndexedDB로 DB 바이너리 읽기·쓰기 성공
- [ ] `IStorageBackend` 정의 및 구현체 2종(OPFS, IndexedDB)
- [ ] Migration Runner 동작(Forward-only, 버전 순 적용)
- [ ] `001_initial` DDL 실행 → `app_settings`, `job`, `category`, `time_entry`, `job_history` 5테이블 생성 및 `schema_version = 1`
- [ ] `002_phase2` DDL 실행 → `external_ref`, `job_category`, `job_template` 추가 및 `schema_version = 2`
- [ ] `PRAGMA foreign_keys=ON` 적용 확인
- [ ] partial unique index `idx_job_active` 생성 확인

---

## 다음 단계

→ Phase 2C: SQLite Repository 구현
