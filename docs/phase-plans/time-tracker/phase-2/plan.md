# Phase 2: 영속화 & Job 완성

## 목표

OPFS + SQLite(sql.js) 영속화 계층을 구현하고, Job CRUD를 완성하며, ExternalRef/JobCategory/DataExport/History 확장 기능을 추가합니다.

---

## 선행 조건

- Phase 1 완료 — MemoryAdapter로 동작하는 프로토타입
- sql.js WASM 바이너리 로드 가능 확인

---

## 참조 설계 문서

| 문서                  | 섹션                 | 참조 내용                                         |
| --------------------- | -------------------- | ------------------------------------------------- |
| `05-storage.md`       | §OPFS + SQLite       | sql.js 초기화, OPFS 파일 읽기/쓰기                |
| `05-storage.md`       | §스키마 마이그레이션 | Forward-only 마이그레이션, migrations 테이블      |
| `05-storage.md`       | §OPFS iframe 제약    | createSyncAccessHandle 불가 시 IndexedDB fallback |
| `05-storage.md`       | §Storage Fallback    | 초기화 실패 / 런타임 실패 시 MemoryAdapter 전환   |
| `05-storage.md`       | §멀티탭 동시 접근    | Web Locks API 사용                                |
| `05-storage.md`       | §데이터 백업         | JSON export/import + versioned migration          |
| `02-architecture.md`  | §4.3 Services        | JobCategoryService, DataExportService             |
| `03-data-model.md`    | §2 테이블 정의       | ExternalRef, JobCategory 테이블 스키마            |
| `01-requirements.md`  | FR-2                 | Job 전체 CRUD                                     |
| `01-requirements.md`  | FR-5                 | Logseq 연동 기초 (ExternalRef)                    |
| `08-test-usecases.md` | §Phase 2 유즈케이스  | 영속화, 폴백, export/import                       |
| `09-user-flows.md`    | UF-07 ~ UF-10        | 데이터 영속화, 내보내기, 외부 참조                |

---

## 서브 단계

### 2A: SQLite Adapter

| 파일 경로 (time-tracker-core 기준)               | 역할                                        |
| ------------------------------------------------ | ------------------------------------------- |
| `adapters/storage/sqlite/sqlite_adapter.ts`      | sql.js 초기화, OPFS 읽기/쓰기, WAL 모드     |
| `adapters/storage/sqlite/migrations/`            | DDL 마이그레이션 파일 (v001_initial.sql ~ ) |
| `adapters/storage/sqlite/migration_runner.ts`    | 마이그레이션 실행기 (forward-only)          |
| `adapters/storage/sqlite/sqlite_unit_of_work.ts` | SQLite 기반 UoW (BEGIN/COMMIT/ROLLBACK)     |

**핵심 패턴**:

- `Database` 인스턴스 생성 (sql.js initSqlJs + WASM)
- OPFS: `navigator.storage.getDirectory()` → 파일 읽기 → `new Database(buffer)`
- 저장: `db.export()` → OPFS 파일 쓰기
- WAL 모드: `PRAGMA journal_mode=WAL;`
- 중첩 트랜잭션: SAVEPOINT/RELEASE/ROLLBACK TO

### 2B: SQLite Repository 구현

| 파일                                                        | 역할                           |
| ----------------------------------------------------------- | ------------------------------ |
| `adapters/storage/sqlite/sqlite_job_repository.ts`          | SQL 기반 Job CRUD              |
| `adapters/storage/sqlite/sqlite_category_repository.ts`     | SQL 기반 Category CRUD         |
| `adapters/storage/sqlite/sqlite_time_entry_repository.ts`   | SQL 기반 TimeEntry CRUD + 필터 |
| `adapters/storage/sqlite/sqlite_history_repository.ts`      | SQL 기반 History CRUD          |
| `adapters/storage/sqlite/sqlite_settings_repository.ts`     | SQL 기반 키-값 저장            |
| `adapters/storage/sqlite/sqlite_external_ref_repository.ts` | ExternalRef CRUD               |
| `adapters/storage/sqlite/sqlite_job_category_repository.ts` | JobCategory M:N 매핑           |

### 2C: Storage Fallback

| 항목        | 설명                                                               |
| ----------- | ------------------------------------------------------------------ |
| 초기화 실패 | OPFS 사용 불가 → IndexedDB fallback → 실패 시 MemoryAdapter        |
| 런타임 실패 | StorageError 3회 연속 → MemoryAdapter 전환 + beforeunload 경고     |
| Web Locks   | `navigator.locks.request('time-tracker-db', ...)`                  |
| 상태 표시   | StorageState (mode: 'sqlite' / 'memory_fallback', fallback_reason) |

### 2D: ExternalRef + JobCategory 서비스

| 파일                               | 역할                                        |
| ---------------------------------- | ------------------------------------------- |
| `services/external_ref_service.ts` | ExternalRef CRUD (Logseq 페이지 ↔ Job 매핑) |
| `services/job_category_service.ts` | JobCategory M:N 매핑 관리                   |

### 2E: DataExport 서비스

| 파일                              | 역할                                                       |
| --------------------------------- | ---------------------------------------------------------- |
| `services/data_export_service.ts` | JSON export (전체/선택), JSON import (versioned migration) |

**Export 형식**:

```json
{
  "version": 1,
  "exported_at": "2026-03-22T10:00:00Z",
  "data": {
    "jobs": [...],
    "categories": [...],
    "time_entries": [...],
    "job_history": [...]
  }
}
```

**Import**: version 필드로 스키마 호환성 검증 → 트랜잭션 내 전체 교체

### 2F: 테스트

| 테스트                        | 범위                           |
| ----------------------------- | ------------------------------ |
| SQLite Repository 단위 테스트 | CRUD + 필터링 + 마이그레이션   |
| Storage Fallback 통합 테스트  | OPFS 실패 → IndexedDB → Memory |
| DataExport 통합 테스트        | export → import 왕복           |
| ExternalRef 단위 테스트       | CRUD + 유일성 제약             |
| Web Locks 테스트              | 동시 접근 시 직렬화            |

---

## 완료 기준

- [ ] SQLite Adapter 초기화 + OPFS 읽기/쓰기
- [ ] 스키마 마이그레이션 (v001_initial.sql)
- [ ] 7개 SQLite Repository 구현
- [ ] Storage Fallback (OPFS → IndexedDB → Memory)
- [ ] Web Locks 동시 접근 방지
- [ ] ExternalRef + JobCategory 서비스
- [ ] DataExport (JSON export/import)
- [ ] beforeunload 경고 (memory_fallback 시)
- [ ] 전체 테스트 통과 + 커버리지 80%+

---

## 다음 단계

→ Phase 3: UI 고도화 & 커스텀 필드 (`phase-3/plan.md`)
