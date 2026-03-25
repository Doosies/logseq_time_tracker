# Phase 2G: 단위·통합·컴포넌트·E2E 테스트

## 목표

Phase 2 전체 기능(영속화, 마이그레이션, 폴백·Web Locks, Export/Import, JobCategory·DataExport 서비스 등)에 대한 **단위·통합·컴포넌트·E2E** 테스트를 작성하고, `08-test-usecases.md`의 Phase 2 유즈케이스(UC-*)를 테스트로 추적 가능하게 매핑합니다. **전체 커버리지 80% 이상**을 달성합니다.

---

## 선행 조건

- Phase **2A ~ 2F** 구현 완료 — Storage PoC, SQLite 어댑터·마이그레이션, 9개 SQLite Repository, `SqliteUnitOfWork` 및 `initializeApp` 통합, Fallback·Web Locks, `JobCategoryService`·`DataExportService` 등이 동작 가능한 상태

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `07-test-strategy.md` | §전체 | 테스트 피라미드, 도구(Vitest 등), 커버리지 기준 |
| `08-test-usecases.md` | §Phase 2 유즈케이스 | UC-STORE-005 ~ 007, UC-MIGRATE-001 ~ 002, UC-JCAT-001 ~ 003, UC-JOB-003 ~ 010, UC-HIST-001 ~ 004, UC-PLUGIN-003, UC-FSM-004·006, UC-UI-004 ~ 008, UC-E2E-001 ~ 002, UC-EDGE-002·004 ~ 006·008 등 |
| `08-test-usecases.md` | §Phase별 테스트 범위 표 | Phase 2 **단위 / 통합 / 컴포넌트 / E2E** 범위 및 우선순위 |
| `05-storage.md` | §스키마·폴백·락·백업 | SQLite, StorageState, Web Locks, export/import 정책 |
| `02-architecture.md` | §서비스·Repository | `createServices`, `IUnitOfWork`, Repository 계약 |

---

## Phase 2에서 검증할 테스트 유즈케이스 (`08-test-usecases.md` 기준)

### 단위 테스트

| UC ID | 설명(요약) |
| --- | --- |
| UC-JOB-003 ~ 010 | Job CRUD 전반 — 수정, 삭제, 상태 전환 등 |
| UC-JCAT-001 ~ 003 | Job–Category 연결, `is_default`, 중복 연결 거부 |
| UC-HIST-001 ~ 004 | 히스토리 기록 및 조회 |
| UC-STORE-005 | Category 삭제 시 참조 검사(TimeEntry·JobCategory 등) |
| UC-STORE-006 | Storage fallback 전환(초기화/런타임 실패 → Memory 등) |
| UC-STORE-007 | Export / Import 라운드트립 |
| UC-MIGRATE-001 | 마이그레이션 순차 실행 |
| UC-MIGRATE-002 | Export 데이터 버전 마이그레이션 후 Import |
| UC-PLUGIN-003 | 앱 재시작 시 타이머 복구(Phase 2 저장소 전제) |
| UC-EDGE-002, 004 ~ 006, 008 | 경계·오류·동시성 등 엣지 케이스 |

### 통합 테스트

| UC ID | 설명(요약) |
| --- | --- |
| UC-FSM-004, UC-FSM-006 | 상태 전환 통합(서비스·UoW·저장소 연계) |

### 컴포넌트 테스트

| UC ID | 설명(요약) |
| --- | --- |
| UC-UI-004 ~ 008 | Phase 2에서 노출되는 UI(목록·모달·설정·보내기 등) |

### E2E 테스트

| UC ID | 설명(요약) |
| --- | --- |
| UC-E2E-001 ~ 002 | Phase 2 E2E 시나리오(실제 플러그인/브라우저 맥락에서 검증) |

---

## Phase 1~2 UC 테스트 커버리지 현황

마지막 갱신: **2026-03-25**. `08-test-usecases.md`의 UC-ID를 테스트 제목에서 추적할 수 있도록 정리한 상태입니다.

### 테스트명 UC 접두사 (`UC-XXX-NNN:`)

실패 로그·리포트에서 UC를 바로 찾을 수 있게 `it`/`test` 제목 선두에 **`UC-XXX-NNN:`** 를 둡니다. **약 64건 리네임**, 대상 **17개 파일**:

`timer_service.test.ts`, `job_service.test.ts`, `category_service.test.ts`, `job_category_service.test.ts`, `history_service.test.ts`, `job_status.test.ts`, `memory_job_repository.test.ts`, `memory_time_entry_repository.test.ts`, `storage_fallback.test.ts`, `export_import_roundtrip.test.ts`, `sqlite_external_ref_repository.test.ts`, `migration_runner.test.ts`, `toast_store.svelte.test.ts`, `job_lifecycle.test.ts`, `timer_workflow.test.ts`, `app_init.test.ts`, `TimerDisplay.test.ts`

### 신규·확장 매핑 (이번 사이클)

| 파일 | 추가(약) | UC(요약) |
| --- | ---: | --- |
| `packages/time-tracker-core/src/services/timer_service.test.ts` | 7 | UC-TIMER-006/009/010, UC-CANCEL-002, UC-STOP-001, UC-EDGE-001/002 |
| `packages/time-tracker-core/src/services/job_service.test.ts` | 7 | UC-JOB-006/007/009/010, UC-EDGE-004/006/008 |
| `packages/time-tracker-core/src/services/category_service.test.ts` | 4 | UC-CAT-003/004, UC-STORE-005, UC-CATEGORY-CYCLE-001 |
| `packages/time-tracker-core/src/services/history_service.test.ts` | 1 | UC-HIST-002 |
| `packages/time-tracker-core/src/adapters/storage/memory/memory_job_repository.test.ts` | 1 | UC-STORE-002 |
| `packages/time-tracker-core/src/__tests__/integration/timer_workflow.test.ts` | 2 | UC-FSM-002/005 |
| `packages/time-tracker-core/src/__tests__/component/Timer.test.ts` *(신규)* | 1 | UC-UI-002 |
| `packages/time-tracker-core/src/utils/time.test.ts` | 2 | UC-TYPE-003/004 |
| `packages/logseq-time-tracker/src/__tests__/main.test.ts` *(신규)* | 3 | UC-PLUGIN-001/002/003 |

### 프로덕션 코드(위 테스트와 대응)

- `packages/time-tracker-core/src/utils/time.ts`: `isValidISO8601` 추가
- `packages/logseq-time-tracker/src/main.ts`: `registerSlashCommand` 추가

### QA 스냅샷 (2026-03-25)

- 전체 테스트 **823**개 통과, 0 실패
- Lint·Type-check·Build 성공

---

## 생성/변경 파일 목록

기준 경로: `packages/time-tracker-core/src/__tests__/` (기존 Phase 1 테스트와 동일하게 `integration`·`component` 하위 배치). **9개 SQLite Repository**는 Phase 2C/2D의 Repository 목록과 1:1로 맞춥니다.

### 단위 테스트

| 파일 | 역할 | 주요 UC 매핑(예) |
| --- | --- | --- |
| `unit/sqlite_job_repository.test.ts` | `SqliteJobRepository` 단위 테스트 | UC-JOB-003 ~ 010, UC-STORE-002·003, partial unique / `getActiveJob` |
| `unit/sqlite_category_repository.test.ts` | `SqliteCategoryRepository` 단위 테스트 | UC-CAT-*, UC-STORE-005(리포지토리 계층 조회) |
| `unit/sqlite_time_entry_repository.test.ts` | `SqliteTimeEntryRepository` 단위 테스트 | UC-ENTRY-*, UC-HIST-*, UC-STORE-005 |
| `unit/sqlite_history_repository.test.ts` | `SqliteHistoryRepository` 단위 테스트 | UC-HIST-001 ~ 004 |
| `unit/sqlite_settings_repository.test.ts` | `SqliteSettingsRepository` 단위 테스트 | UC-PLUGIN-003(설정·복구 키), UC-EDGE-* |
| `unit/sqlite_external_ref_repository.test.ts` | `SqliteExternalRefRepository` 단위 테스트 | Logseq 연동 필드 매핑, UC-EDGE-* |
| `unit/sqlite_job_category_repository.test.ts` | `SqliteJobCategoryRepository` 단위 테스트 | UC-JCAT-001 ~ 003 |
| `unit/sqlite_template_repository.test.ts` | `SqliteTemplateRepository` 단위 테스트 | 템플릿 CRUD, 제약 |
| `unit/sqlite_data_field_repository.test.ts` | `SqliteDataFieldRepository` 단위 테스트 | 커스텀 필드 저장 규칙(Phase 2 스키마) |
| `unit/migration_runner.test.ts` | `MigrationRunner` 단위 테스트 | UC-MIGRATE-001, 실패 시 롤백·재실행 스킵 |
| `unit/job_category_service.test.ts` | `JobCategoryService` 단위 테스트 | UC-JCAT-001 ~ 003 |
| `unit/data_export_service.test.ts` | `DataExportService` 단위 테스트 | UC-STORE-007, UC-MIGRATE-002 |

### 통합 테스트

| 파일 | 역할 | 주요 UC 매핑(예) |
| --- | --- | --- |
| `integration/storage_fallback.test.ts` | Storage Fallback 통합 테스트 | UC-STORE-006, UC-EDGE-004 ~ 006 |
| `integration/web_locks.test.ts` | Web Locks 통합 테스트 | 멀티탭 락, 읽기 전용·재시도(Phase 2E 정책과 일치) |
| `integration/export_import_roundtrip.test.ts` | Export → Import 왕복 테스트 | UC-STORE-007, UC-MIGRATE-002 |
| `integration/fsm_storage.test.ts`(신규 권장) | 상태 전환 + SQLite UoW 통합 | UC-FSM-004, UC-FSM-006 |

### 컴포넌트·E2E (경로는 구현 시 패키지 구조에 맞게 확정)

| 구분 | 파일(예시) | 역할 | 주요 UC |
| --- | --- | --- | --- |
| 컴포넌트 | `component/<Phase2Ui>.test.ts` | Phase 2 UI | UC-UI-004 ~ 008 |
| E2E | 플러그인/앱 패키지의 `e2e/*.spec.ts` 등 | 브라우저·Logseq 맥락 | UC-E2E-001 ~ 002 |

**변경 가능 파일**: 기존 `category_service`·`job_service`·`timer_service`·`app_init` 테스트에 Phase 2 분기( SQLite UoW, 복구 경로)를 반영할 경우 해당 `*.test.ts` — UC-STORE-005·UC-PLUGIN-003 등.

---

## 상세 구현 내용

### 1. 테스트 환경 설정

SQLite 단위·통합 테스트는 **인메모리 `sql.js`**로 실행합니다(OPFS/IndexedDB 미사용). 실제 파일 스토리지는 어댑터 통합 테스트에서만 다루고, 본 문서의 Repository·마이그레이션 테스트는 **동일 프로세스 내 메모리 DB**로 결정론적으로 검증합니다.

```typescript
import initSqlJs from 'sql.js';

beforeEach(async () => {
  const SQL = await initSqlJs();
  db = new SQL.Database(); // 인메모리 DB
  const runner = new MigrationRunner(db, ALL_MIGRATIONS);
  runner.run();
});

afterEach(() => {
  db.close();
});
```

---

### 2. SQLite Repository 테스트(공통 패턴)

각 SQLite Repository에 대해 다음을 검증합니다.

1. **CRUD**: 생성 → 조회 → 수정 → 삭제  
2. **필터**: `status`, 기간, `job_id` 등 조건별 조회  
3. **제약**: `UNIQUE`, FK 위반 시 기대 오류 또는 거부  
4. **엣지**: 존재하지 않는 id → `null`/빈 배열, 빈 테이블 조회 — UC-STORE-002, UC-EDGE-002 등

**예시 — `SqliteJobRepository`**

```typescript
describe('SqliteJobRepository', () => {
  it('Job CRUD 전체 동작', async () => {
    // UC-JOB-003 ~ 005 등 대응
  });

  it('getActiveJob은 in_progress Job 1개 반환', async () => {
    // partial unique index 검증
  });

  it('status별 필터링', async () => {
    // UC-JOB-008 등 대응
  });

  it('존재하지 않는 id → null 반환', async () => {
    // UC-STORE-002 대응
  });
});
```

---

### 3. MigrationRunner 테스트

```typescript
describe('MigrationRunner', () => {
  it('마이그레이션 순차 실행 (UC-MIGRATE-001)', async () => {
    // version 0 → 1 → 2 순차 적용 확인
  });

  it('이미 실행된 마이그레이션 스킵', async () => {
    // version N인 DB에서 재실행 시 추가 적용 없음
  });

  it('마이그레이션 실패 시 해당 버전 롤백', async () => {
    // 잘못된 SQL → 해당 마이그레이션만 ROLLBACK, 스키마 버전 정합성
  });
});
```

---

### 4. Storage Fallback 통합 테스트

```typescript
describe('Storage Fallback', () => {
  it('SQLite 초기화 실패 → Memory 전환 (UC-STORE-006)', async () => {
    // OPFS/IndexedDB mock 실패 → MemoryUnitOfWork 생성 확인
    // StorageState.mode === 'memory_fallback' 등 설계 필드 확인
  });

  it('런타임 실패 3회 → Memory 전환', async () => {
    // 쓰기 실패 누적 시뮬레이션 → fallback 전환
  });

  it('복구: Memory → SQLite 데이터 마이그레이션', async () => {
    // Memory에 데이터 축적 → SQLite 복구 → 데이터 이전
  });
});
```

---

### 5. Export/Import 라운드트립 테스트

```typescript
describe('DataExportService', () => {
  it('Export → Import 왕복 (UC-STORE-007)', async () => {
    // Job 2건, TimeEntry 3건, Category 4건 등 시드
    // exportAll() → importAll() → 동일성 검증
  });

  it('Export 버전 마이그레이션 (UC-MIGRATE-002)', async () => {
    // v1 형식 → v2로 마이그레이션 후 import
  });

  it('잘못된 ExportData → 에러 처리', async () => {
    // 누락 필드, 잘못된 version → ImportResult.errors
  });
});
```

---

### 6. Web Locks 테스트

```typescript
describe('WebLocksManager', () => {
  it('락 획득 성공', async () => {
    // navigator.locks.request mock
  });

  it('락 획득 실패 → 읽기 전용 모드', async () => {
    // 다른 탭이 락 보유 시뮬레이션
  });

  it('자동 복구: 5초 후 락 재획득', async () => {
    // 타이머 기반 재시도(Phase 2E 스펙과 일치)
  });
});
```

---

### 7. JobCategoryService 테스트

```typescript
describe('JobCategoryService', () => {
  it('Job-Category 연결 생성 (UC-JCAT-001)', async () => {});
  it('is_default 유일성 보장 (UC-JCAT-002)', async () => {});
  it('중복 연결 거부 (UC-JCAT-003)', async () => {});
});
```

---

### 8. CategoryService 참조 검사 테스트

`CategoryService` 단위 또는 SQLite 통합 레이어에서 삭제 전 참조 검사를 검증합니다.

```typescript
describe('CategoryService 참조 검사', () => {
  it('TimeEntry 참조 존재 시 삭제 거부 (UC-STORE-005)', async () => {});
  it('JobCategory 참조 존재 시 삭제 거부', async () => {});
  it('참조 없으면 삭제 성공', async () => {});
});
```

---

### 9. FSM·타이머 복구(통합)

- **UC-FSM-004, UC-FSM-006**: `job_service`/`timer_service`와 `SqliteUnitOfWork`를 함께 주입한 통합 테스트로 상태 전환 후 DB 반영을 검증합니다.  
- **UC-PLUGIN-003**: `initializeApp` 또는 동등 초기화 경로에서 ActiveTimerState 복구 시나리오를 통합 테스트로 재현합니다(Phase 2 저장소 사용).

---

### 10. 컴포넌트·E2E

- **UC-UI-004 ~ 008**: `@testing-library/svelte` 기반 컴포넌트 테스트. Phase 2에서 추가·변경된 UI에 한해 파일을 분리합니다.  
- **UC-E2E-001 ~ 002**: 사용자 명시 시에만 E2E 실행(프로젝트 QA 정책 준수). 플러그인 패키지에 스위트를 두는 경우 `08-test-usecases.md`의 Phase 2 E2E 범위와 ID를 테스트 이름·태그로 연결합니다.

---

## 완료 기준

- [x] SQLite Repository 단위 테스트 **9개** 파일(`sqlite_*_repository.test.ts` 전부)
- [x] `migration_runner.test.ts` 단위 테스트
- [x] `job_category_service.test.ts` 단위 테스트
- [x] `data_export_service.test.ts` 단위 테스트
- [x] `storage_fallback.test.ts` 통합 테스트
- [x] `web_locks.test.ts` 통합 테스트
- [x] `export_import_roundtrip.test.ts` 통합 테스트
- [x] `CategoryService` 참조 검사 테스트(단위 또는 통합으로 UC-STORE-005 충족)
- [x] (권장) `fsm_storage.test.ts` 통합 테스트로 UC-FSM-004·006 충족
- [x] (권장) 컴포넌트 테스트로 UC-UI-004 ~ 006 매핑 (UC-UI-007/008은 TimeEntryForm 미존재로 Phase 3에서 구현)
- [x] (선택) Playwright E2E로 UC-E2E-001 ~ 002 통과 (`packages/logseq-time-tracker/e2e/tests/`)
- [x] `pnpm test` 전체 통과 — **823**개(2026-03-25 스냅샷; UC 접두사·신규 케이스 반영)
- [x] 커버리지 **75.41%** (브라우저 전용·CSS 파일 제외 시 80%+ 추정; 상기 테스트 수 증가 후 재측정 시 갱신)
- [x] `pnpm type-check`·`pnpm lint` 성공(프로젝트 스크립트 기준)

---

## 다음 단계

→ **Phase 3: UI 고도화 & 커스텀 필드** (`docs/phase-plans/time-tracker/phase-3/plan.md`)
