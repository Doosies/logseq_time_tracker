# Phase 2C: SQLite Repository

## 목표

**9개** SQLite Repository(`IJobRepository`, `ICategoryRepository`, `ITimeEntryRepository`, `IHistoryRepository`, `ISettingsRepository`, `IExternalRefRepository`, `IJobCategoryRepository`, `ITemplateRepository`, `IDataFieldRepository`)를 구현합니다. 기존 Memory Repository와 동일하게 `adapters/storage/repositories.ts`에 정의된 인터페이스를 준수하고, SQL(sql.js `Database`)로 CRUD·필터·조인 규칙을 처리합니다. 공통으로 **row → 도메인 객체** 변환은 `row_mapper.ts` 및 각 파일의 매핑 헬퍼로 일관되게 적용합니다.

---

## 선행 조건

- **Phase 2B 완료**: `SqliteAdapter`, 마이그레이션 러너, DDL(시스템 테이블·인덱스·`app_settings` 등)이 적용된 상태에서 본 Phase를 진행합니다.
- Phase 1 Memory 구현과 동작 시맨틱(에러·경고·정렬)을 맞추는 것을 전제로 합니다.

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
|------|------|------|
| `05-storage.md` | §Repository 인터페이스 | 9개 인터페이스 시그니처 |
| `03-data-model.md` | §2 테이블 정의 | 컬럼–필드 매핑, 제약 조건 |
| `02-architecture.md` | §13 저장 규칙 | Plain Object 전용; SQLite에서는 row 매핑으로 동등한 계약(매 조회 새 객체) 유지 |

실제 경로: `docs/time-tracker/` 하위. 인터페이스 단일 진실 공급원은 `packages/time-tracker-core/src/adapters/storage/repositories.ts`이며, 설계 문서와 불일치 시 코드를 우선합니다.

---

## 생성/변경 파일 목록

`time-tracker-core/src` 기준입니다.

| 파일 | 역할 |
|------|------|
| `adapters/storage/sqlite/sqlite_job_repository.ts` | SQL 기반 Job CRUD, `getActiveJob`, status 필터 |
| `adapters/storage/sqlite/sqlite_category_repository.ts` | SQL 기반 Category CRUD |
| `adapters/storage/sqlite/sqlite_time_entry_repository.ts` | SQL 기반 TimeEntry CRUD + 기간 필터 |
| `adapters/storage/sqlite/sqlite_history_repository.ts` | SQL 기반 JobHistory CRUD + 기간 필터 |
| `adapters/storage/sqlite/sqlite_settings_repository.ts` | SQL 기반 key–value 설정(`app_settings`) |
| `adapters/storage/sqlite/sqlite_external_ref_repository.ts` | SQL 기반 ExternalRef CRUD, 역방향 조회 |
| `adapters/storage/sqlite/sqlite_job_category_repository.ts` | SQL 기반 JobCategory M:N CRUD |
| `adapters/storage/sqlite/sqlite_template_repository.ts` | SQL 기반 JobTemplate CRUD, `placeholders` JSON |
| `adapters/storage/sqlite/sqlite_data_field_repository.ts` | SQL 기반 DataField CRUD(Phase 3 스키마 전 스텁 또는 DDL 반영 시 최소 구현) |
| `adapters/storage/sqlite/row_mapper.ts` | SQL row(`Record<string, unknown>`) → 도메인 타입 변환 공통 유틸(파싱·boolean·null 처리) |

**변경(예상)**: `adapters/storage/index.ts` 등에서 SQLite Repository 클래스 export, Phase 2D에서 `SqliteUnitOfWork`가 위 구현체를 조립.

---

## 상세 구현 내용

### 1. Row Mapper 패턴

각 Repository는 `db.exec`/`db.run` 결과를 행 단위로 받아 도메인 타입으로 바꿉니다. 공통 규칙은 `row_mapper.ts`에 두고, 엔티티별 세부 필드 조립은 해당 Repository 또는 `row_mapper`의 전용 함수로 둡니다.

예시(Job):

```typescript
function mapRowToJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string | undefined,
    status: row.status as StatusKind,
    custom_fields: row.custom_fields as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
```

- **INTEGER ↔ boolean**: SQLite에 `0`/`1` 등으로 저장된 컬럼은 `!!row.is_active` 또는 명시적 `Number(row.is_active) !== 0` 등으로 TypeScript `boolean`에 맞춥니다(`Category.is_active`, `TimeEntry.is_manual`, `JobCategory.is_default` 등).
- **TEXT JSON**: `custom_fields`, `placeholders` 등은 읽을 때 `JSON.parse` 시도, **실패 시** 설계 정책에 맞게 fallback(예: `custom_fields`는 `null` 유지 또는 빈 객체 문자열 정책은 `03-data-model.md` §3과 UI 계약에 따름; `placeholders`는 `[]` + `console.warn`).
- **조회 반환값**: Memory와 같이 호출자가 독립적으로 수정할 수 있도록, **매 조회마다 새 객체**를 구성합니다(sql.js row 참조를 그대로 노출하지 않음).

### 2. 공통 패턴: 모든 Repository

- **생성자**: sql.js `Database` 인스턴스를 주입받습니다.
- **쓰기**: `db.run(sql, params)`(prepared statement 바인딩)로 `INSERT`/`UPDATE`/`DELETE`를 수행합니다.
- **조회**: `db.exec(sql)` 결과의 `[{ columns, values }]`를 순회하며 `columns`와 `values[i]`로 `Record<string, unknown>` 행을 만든 뒤 매핑 함수에 넘깁니다.
- **에러 시맨틱**: Memory 구현과 동일하게 유지합니다. 예: `MemoryJobRepository.updateJobStatus`는 존재하지 않는 id에 `StorageError`를 던지므로, SQLite에서도 `UPDATE` 영향 행 수가 0이면 동일하게 처리합니다.
- **§13 저장 규칙 대응**: Memory의 `structuredClone` 역할을 SQLite에서는 **순수 매핑으로 새 plain object 생성**으로 대체합니다.

### 3. SqliteJobRepository 주요 메서드

| 메서드 | SQL/동작 요약 |
|--------|----------------|
| `getJobs()` | `SELECT * FROM job ORDER BY created_at DESC` |
| `getJobById(id)` | `SELECT * FROM job WHERE id = ?` |
| `getJobsByStatus(status)` | `SELECT * FROM job WHERE status = ?` (정렬은 Memory와 동일하게 맞출지 `created_at` 기준으로 통일) |
| `getActiveJob()` | `SELECT * FROM job WHERE status = 'in_progress'` — 다건이면 **첫 행만 반환**하고 `console.warn` (Memory와 동일 메시지 권장). DDL에 partial unique index가 있어도 레거시·수동 DB 대비 방어 로직 유지 |
| `upsertJob(job)` | `INSERT OR REPLACE INTO job (...)` 또는 `ON CONFLICT` 전략(2B DDL의 PK 정의에 맞출 것) |
| `updateJobStatus(id, status, updated_at)` | `UPDATE job SET status = ?, updated_at = ? WHERE id = ?` — 0행이면 `StorageError` |
| `deleteJob(id)` | `DELETE FROM job WHERE id = ?` |

`custom_fields`는 DB에는 TEXT JSON으로 저장; 도메인 `Job`의 해당 필드 타입에 맞게 직렬화·역직렬화합니다.

### 4. SqliteTimeEntryRepository 주요 메서드

- `getTimeEntries(filters?)`: `WHERE` 절을 동적으로 조합합니다.
  - `job_id`, `category_id`: 등호 조건
  - `from_date`, `to_date`: **`started_at` 기준**, inclusive 범위(UTC ISO8601 문자열 비교; 필요 시 `date(started_at)` 정규화는 설계와 동일한 기준 유지)
- `getTimeEntryById`, `upsertTimeEntry`, `deleteTimeEntry`: 해당 테이블 PK 기준 CRUD
- `deleteByJobId(job_id)`: `DELETE FROM time_entry WHERE job_id = ?`
- `is_manual` 등 boolean 컬럼은 §1의 INTEGER 변환 규칙 적용

### 5. SqliteHistoryRepository 주요 메서드

- `getJobHistory(job_id)`: `SELECT * FROM job_history WHERE job_id = ? ORDER BY occurred_at ASC`
- `getJobHistoryByPeriod(filters)`: `job_id`, `from_date`, `to_date`를 optional로 조합; 기간은 **`occurred_at` 기준** inclusive(필터 의미는 `HistoryFilter` 타입과 Memory 구현과 일치)
- `appendJobHistory(record)`: `INSERT INTO job_history ...`
- `deleteByJobId(job_id)`: `DELETE FROM job_history WHERE job_id = ?`
- `from_status`는 NULL 허용; SQLite NULL 매핑 주의

### 6. SqliteSettingsRepository

- 테이블: **`app_settings(key PRIMARY, value TEXT)`** (2B DDL과 동일한 스키마 가정)
- `getSetting(key)`: `SELECT value FROM app_settings WHERE key = ?` → `JSON.parse`로 `SettingsMap[K]` 복원; 없으면 `null`
- `setSetting(key, value)`: `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)` with `JSON.stringify(value)`
- `deleteSetting(key)`: `DELETE FROM app_settings WHERE key = ?`
- **null/제거 의미**: 앱 계약상 “값 제거”는 `deleteSetting`을 사용합니다. Memory 구현과 동일하게 맞추고, “null 저장”이 필요 없으면 row 삭제로 일관 처리합니다.

### 7. SqliteExternalRefRepository

- 제약: **`UNIQUE(job_id, system_key)`** — `upsert` 시 동일 키면 갱신
- CRUD: job_id 기준 목록, 복합 키 조회, id 기준 삭제, `deleteByJobId`
- `getExternalRefBySystemAndValue(system_key, ref_value)`: 역방향 조회 `SELECT ... WHERE system_key = ? AND ref_value = ? LIMIT 1`

### 8. SqliteJobCategoryRepository

- 제약: **`UNIQUE(job_id, category_id)`**
- `getJobCategories(job_id)`, `getCategoryJobs(category_id)`: 각각 FK로 필터
- `upsertJobCategory`, `deleteJobCategory`, `deleteByJobId`
- `is_default` boolean 변환 및 Memory와 동일한 정렬(있다면) 유지

### 9. SqliteTemplateRepository

- `placeholders` 컬럼: 저장 시 `JSON.stringify`, 로드 시 `JSON.parse`, 실패 시 `[]` + 경고 로그(`03-data-model.md` §2.6)
- 나머지는 일반 CRUD

### 10. SqliteDataFieldRepository (Phase 3 준비)

- `03-data-model.md`: DataField·메타 테이블은 Phase 3 중심. **Phase 2B DDL에 `data_field` 테이블이 없으면** 본 Phase에서는 Memory 스텁과 동일하게 빈 구현(항상 `[]` / no-op)하거나, DDL에 선반영된 경우에만 **최소 CRUD**를 구현합니다.
- 인터페이스(`getDataFields`, `upsertDataField`, `deleteDataField`)는 깨지지 않게 유지합니다.

---

## 완료 기준

- [x] 9개 SQLite Repository 구현(`IDataFieldRepository` 포함; DataField는 스텁 또는 DDL 유무에 따른 최소 구현)
- [x] 모든 Repository가 `repositories.ts`의 인터페이스 시그니처·의미(Memory와 동일한 에러·경고) 준수
- [x] Row Mapper(및 엔티티 매핑)로 SQL row → TypeScript 도메인 객체 변환, 조회마다 독립 객체
- [x] INTEGER boolean ↔ TypeScript boolean 변환 처리
- [x] JSON 컬럼(`custom_fields`, `placeholders` 등) 파싱 실패 시 fallback 및 정책 일치
- [x] `TimeEntryFilter` 동적 `WHERE` 절 구현(`started_at` 기준 기간 inclusive)
- [x] `HistoryFilter` 동적 `WHERE` 절 구현(`occurred_at` 기준 기간 inclusive)
- [x] ExternalRef `(job_id, system_key)` 유일성 제약을 upsert 전략에 반영
- [x] JobCategory `(job_id, category_id)` 유일성 제약을 upsert 전략에 반영
- [ ] 단위 테스트(선택): Memory 대비 동일 시나리오 스모크 또는 Repository별 SQL 통합 테스트(Phase 계획에 따름)

---

## 다음 단계

→ **Phase 2D**: SQLite `UnitOfWork` 조립 및 앱 통합 (`2d-integration.md`)
