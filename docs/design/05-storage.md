# 영속화 설계 (Storage)

## 개요

타임 트래커는 **Logseq에 의존하지 않는** 저장소를 사용합니다. 상태 관리, 기본값, 설정 등은 **껍데기만 Logseq**이고, 본체는 **독립 Storage**로 설계합니다.

---

## 핵심 원칙

> **아키텍처 원칙**: [02-architecture.md §1 아키텍처 스타일](02-architecture.md) 참조. Repository + UoW 패턴, 플랫폼 무관, 다중 백엔드 전략의 근거가 정의되어 있습니다.

---

## Repository 인터페이스

```typescript
// Repository 인터페이스 (역할별 분리)

export interface IJobRepository {
    getJobs(): Promise<Job[]>;
    getJobById(id: string): Promise<Job | null>;
    getJobsByStatus(status: StatusKind): Promise<Job[]>;
    getActiveJob(): Promise<Job | null>; // in_progress Job이 2개 이상이면(불변 조건 위반) 첫 번째 반환 + console.warn
    upsertJob(job: Job): Promise<void>;
    updateJobStatus(id: string, status: StatusKind): Promise<void>;
    deleteJob(id: string): Promise<void>;
}

export interface ICategoryRepository {
    getCategories(): Promise<Category[]>;
    getCategoryById(id: string): Promise<Category | null>;
    upsertCategory(category: Category): Promise<void>;
    deleteCategory(id: string): Promise<void>;
}

export interface ITimeEntryRepository {
    getTimeEntries(filters?: TimeEntryFilter): Promise<TimeEntry[]>;
    getTimeEntryById(id: string): Promise<TimeEntry | null>;
    upsertTimeEntry(entry: TimeEntry): Promise<void>;
    deleteTimeEntry(id: string): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface IHistoryRepository {
    getJobHistory(job_id: string): Promise<JobHistory[]>;
    getJobHistoryByPeriod(filters: HistoryFilter): Promise<JobHistory[]>;
    appendJobHistory(record: JobHistory): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface IExternalRefRepository {
    getExternalRefs(job_id: string): Promise<ExternalRef[]>;
    getExternalRef(job_id: string, system_key: string): Promise<ExternalRef | null>;
    getExternalRefBySystemAndValue(system_key: string, ref_value: string): Promise<ExternalRef | null>; // FR-1.1: 페이지 UUID → Job 역방향 조회
    upsertExternalRef(ref: ExternalRef): Promise<void>;
    deleteExternalRef(id: string): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface ISettingsRepository {
    getSetting<K extends keyof SettingsMap>(key: K): Promise<SettingsMap[K] | null>;
    setSetting<K extends keyof SettingsMap>(key: K, value: SettingsMap[K]): Promise<void>;
}

// 구현 시 타입 안전성을 위한 맵 (구현 파일에서 정의)
type SettingsMap = {
    active_timer: ActiveTimerState;
    last_selected_category: string;
    // Phase별 확장
};

export interface ITemplateRepository {
    getTemplates(): Promise<JobTemplate[]>;
    getTemplateById(id: string): Promise<JobTemplate | null>;
    upsertTemplate(template: JobTemplate): Promise<void>;
    deleteTemplate(id: string): Promise<void>;
}

export interface IJobCategoryRepository {
    getJobCategories(job_id: string): Promise<JobCategory[]>;
    getCategoryJobs(category_id: string): Promise<JobCategory[]>;
    upsertJobCategory(jc: JobCategory): Promise<void>;
    deleteJobCategory(id: string): Promise<void>;
    deleteByJobId(job_id: string): Promise<void>;
}

export interface IDataFieldRepository {
    getDataFields(entity_type_id: string): Promise<DataField[]>;
    upsertDataField(field: DataField): Promise<void>;
    deleteDataField(id: string): Promise<void>;
}

// 트랜잭션 + Repository 접근
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

export interface TimeEntryFilter {
    job_id?: string;
    category_id?: string;
    from_date?: string; // inclusive: started_at >= from_date
    to_date?: string; // inclusive: started_at <= to_date
}

export interface HistoryFilter {
    job_id?: string;
    from_date?: string;
    to_date?: string;
}
```

> **TimeEntryFilter 시맨틱**: `from_date`/`to_date`는 **`started_at` 기준** 필터입니다 (inclusive). 구간이 경계에 걸치는 TimeEntry(예: 09:00~11:00인데 from_date=10:00)는 `started_at(09:00) < from_date(10:00)`이므로 결과에 **포함되지 않습니다**. overlap 감지는 서비스 레이어(`TimeEntryService.detectOverlaps`)에서 구간 겹침 로직(`started_at < to_date AND ended_at > from_date`)으로 별도 처리합니다. 통계 쿼리(`StatisticsService.getDailySummary`)는 이 필터를 사용하므로, 기간 경계에 걸치는 TimeEntry의 전체 시간이 `started_at` 기준 날짜에 할당됩니다.

---

## 구현체

### 1. MemoryUnitOfWork (Phase 1)

테스트 및 프로토타입용. 역할별 `Memory*Repository`와 인메모리 Map 사용.

```typescript
export class MemoryJobRepository implements IJobRepository {
    private jobs = new Map<string, Job>();

    async getJobs(): Promise<Job[]> {
        return Array.from(this.jobs.values());
    }
    // ... 나머지 메서드
}

export class MemoryUnitOfWork implements IUnitOfWork {
    readonly jobRepo = new MemoryJobRepository();
    readonly categoryRepo = new MemoryCategoryRepository();
    // ... 나머지 repository

    async transaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
        const snapshot = this.createSnapshot(); // structuredClone으로 전체 Map 스냅샷
        try {
            return await fn(this);
        } catch (e) {
            this.restoreSnapshot(snapshot);
            throw e;
        }
    }
}
```

**용도**:

- 단위 테스트
- Phase 1 프로토타입 (UI 피드백 확인)
- CI 환경

> **성능 주의**: `structuredClone(Map)` 스냅샷은 데이터가 많아지면 O(N) 비용이 발생합니다. Phase 1에서는 데이터 규모가 작으므로 문제 없지만, Phase 2+ SQLite 전환 시 이 방식은 사용되지 않습니다 (SQLite의 네이티브 트랜잭션으로 대체).

---

### 2. OPFS + SQLite Adapter (Phase 2~3)

브라우저 환경에서 OPFS(Origin Private File System)에 SQLite DB 파일 저장.

**기술 스택**:

- `sql.js` (WASM) 또는 `@sqlite.org/sqlite-wasm` (공식 wasm 빌드)
- OPFS를 파일 시스템으로 노출하는 VFS 사용

**장점**:

- 로컬 영속화
- SQL 쿼리로 복잡한 필터/집계 가능
- 기간별, 잡별 통계 쿼리

**제약**:

- 브라우저 환경 전용
- IndexedDB 또는 OPFS 선택 (OPFS 권장: 성능, 용량)
- **동시 접근 제약**: OPFS SQLite는 단일 탭/창에서만 안전하게 접근 가능. 여러 탭에서 동시 접근 시 데이터 손상 위험이 있으므로, Web Locks API로 배타적 접근을 보장하거나, 향후 SharedWorker를 통한 단일 접근점 구조로 개선 검토

---

### 3. LogseqStorageAdapter (Phase 4~5, 선택)

Logseq 그래프를 백엔드로 사용. **선택적 동기화**용.

- Job, Category, TimeEntry를 Logseq 페이지/블록으로 저장
- `_internal_*` property로 메타데이터 숨김
- 주 저장소는 OPFS SQLite, Logseq는 export/import 또는 양방향 sync 옵션

**역할**:

- Logseq 그래프와 동기화가 필요한 사용자
- 플러그인 제거 시 데이터 백업 옵션

---

## 저장소 선택 흐름

```
┌─────────────────────────────────────────────────────────┐
│                    Application                            │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│               IUnitOfWork (interface)                    │
└─────────────────────────┬───────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
│ MemoryUoW    │  │ SqliteUoW    │  │ LogseqAdapter     │
│ (Phase 1)    │  │ (OPFS, Phase2)│  │ (Phase 4~5, 선택) │
└──────────────┘  └──────────────┘  └──────────────────┘
```

---

## 의존성 주입

> **서비스 초기화 + 팩토리 함수**: [02-architecture.md §8 서비스 초기화](02-architecture.md) 참조. `createServices(uow, logger)` 팩토리의 의존성 순서와 초기화 규칙이 정의되어 있습니다.

---

## 진행 중 타이머 영속화 전략

TimeEntry는 타이머 종료 시에만 완성되는 구조이므로, **진행 중인 타이머 상태**를 별도로 영속화하여 브라우저 새로고침/재시작 시 복구할 수 있어야 합니다.

### ActiveTimerState

Settings key-value를 활용하여 `active_timer` 키에 다음 데이터를 저장합니다:

```typescript
interface ActiveTimerState {
    version: number; // 마이그레이션용 버전 필드
    job_id: string;
    category_id: string;
    started_at: string; // ISO8601
    is_paused: boolean;
    paused_at?: string; // ISO8601 (일시정지 시각)
    accumulated_ms: number; // 일시정지 구간을 제외한 누적 시간
}
```

### 영속화 시점

| 이벤트          | 동작                                                                          |
| --------------- | ----------------------------------------------------------------------------- |
| 타이머 시작     | `ISettingsRepository.setSetting('active_timer', state)` 저장                  |
| 타이머 일시정지 | `is_paused: true`, `paused_at`, `accumulated_ms` 갱신                         |
| 타이머 재개     | `is_paused: false`, `paused_at` 제거                                          |
| 타이머 종료     | TimeEntry 생성 후 `ISettingsRepository.setSetting('active_timer', null)` 제거 |
| 주기적 백업     | 30초 간격으로 `accumulated_ms` 갱신 (비정상 종료 대비)                        |

### 앱 재시작 시 복구

1. `ISettingsRepository.getSetting('active_timer')` 조회
2. 값이 존재하면 → **참조 무결성 검증**: `job_id`로 `IJobRepository.getJobById()` 조회
3. Job이 존재하지 않거나 `status`가 `in_progress`/`paused`가 아닌 경우:
    - ActiveTimerState를 `null`로 삭제 (고아 상태 정리)
    - `ILogger.warn('ActiveTimerState 참조 무결성 복구: orphan state 삭제')` 기록
    - UI는 초기 상태로 표시
4. Job이 유효하면 → TimerStore에 상태 복원, UI에 "진행 중" 표시
5. `is_paused === false`이면 → `started_at` + `accumulated_ms`로 경과 시간 재계산

---

## Settings 역할 구분

`ISettingsRepository`의 `getSetting`/`setSetting`과 02-architecture.md의 `ISettingsAdapter`는 역할이 다릅니다:

| 인터페이스                                    | 패키지                | 역할                         | 예시                                                  |
| --------------------------------------------- | --------------------- | ---------------------------- | ----------------------------------------------------- |
| `ISettingsRepository.getSetting`/`setSetting` | `time-tracker-core`   | 앱 내부 데이터 영속화        | `active_timer`, 카테고리 기본값, 마지막 선택 카테고리 |
| `ISettingsAdapter`                            | `logseq-time-tracker` | Logseq 플러그인 설정 UI 연동 | Logseq Settings 패널에 노출되는 사용자 환경 설정      |

- `ISettingsRepository`는 core 패키지에서 사용 (플랫폼 무관)
- `ISettingsAdapter`는 Logseq 플러그인 레이어에서만 사용 (`logseq.useSettingsSchema` 등)

---

## Phase 1 범위

- Repository 인터페이스 및 `IUnitOfWork` 정의 (`IJobRepository`, `ICategoryRepository`, `ITimeEntryRepository`, `IHistoryRepository`, `ISettingsRepository` 등)
- `MemoryUnitOfWork` 및 각 `Memory*Repository` 구현
- `TimerService`가 `IUnitOfWork`를 주입받아 `TimeEntry` 저장
- 영속화는 **메모리만** (재시작 시 초기화)
- `ActiveTimerState` 영속화 인터페이스 정의 (Phase 1에서는 메모리, Phase 2에서 SQLite 백엔드)

### Phase 1 제한사항

- Phase 1은 **단일 탭/창에서만 동작을 보장**합니다
- 여러 탭에서 동시 사용 시 각 탭이 독립된 메모리 상태를 가지므로, "진행중 1개" 제약이 탭 간에 보장되지 않습니다
- Phase 2에서 Web Locks API (`navigator.locks.request('time-tracker-db', fn)`)로 배타적 DB 접근을 보장하여 해결합니다

### Phase별 인터페이스 구현 범위

| Phase   | Repository / 단위                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 | `IJobRepository`, `ICategoryRepository`, `ITimeEntryRepository`, `IHistoryRepository`, `ISettingsRepository`, `IUnitOfWork` |
| Phase 2 | `IExternalRefRepository`, `ITemplateRepository`, `IJobCategoryRepository`                                                   |
| Phase 3 | `IDataFieldRepository`                                                                                                      |

### CategoryService Phase 분할

| 기능                           | Phase | 상세                                                                     |
| ------------------------------ | ----- | ------------------------------------------------------------------------ |
| Category CRUD (생성/수정/조회) | 1     | 기본 CRUD, 트리 깊이 10 제한 검증                                        |
| Category 시드 데이터           | 1     | 앱 초기화 시 기본 카테고리 삽입                                          |
| Category 삭제 참조 검사        | 2     | TimeEntry/JobCategory 참조 존재 시 삭제 거부 (`ReferenceIntegrityError`) |

> Phase 1에서는 Category 삭제가 참조 검사 없이 동작합니다 (MemoryAdapter에서는 데이터가 휘발성이므로 안전). Phase 2에서 SQLite 백엔드 도입 시 참조 검사를 활성화합니다.

### 페이지네이션 (Phase 3+)

Phase 1~2는 전체 로드 방식을 사용합니다 (데이터 규모 수백~수천 건에서 충분). Phase 3에서 Repository 인터페이스에 선택적 `PaginationOptions` 파라미터 도입을 검토합니다.

---

## 트랜잭션 처리

"진행중 1개" 제약을 원자적으로 보장하기 위해 `IUnitOfWork.transaction()`을 사용합니다.

```typescript
// TimerService.start() 내부 — 기존 Job paused + 새 Job in_progress를 원자적으로 수행
await uow.transaction(async (tx) => {
    await tx.timeEntryRepo.upsertTimeEntry(active_job_time_entry);
    await tx.jobRepo.updateJobStatus(active_job_id, 'paused');
    await tx.jobRepo.updateJobStatus(new_job_id, 'in_progress');
    await tx.historyRepo.appendJobHistory(/* paused history */);
    await tx.historyRepo.appendJobHistory(/* in_progress history */);
    await tx.settingsRepo.setSetting('active_timer', new_state);
});
```

| 구현체           | 트랜잭션 방식                                      |
| ---------------- | -------------------------------------------------- |
| MemoryUnitOfWork | 순차 실행 (단일 스레드, 실패 시 상태 롤백)         |
| SqliteUnitOfWork | `BEGIN TRANSACTION ... COMMIT`, 실패 시 `ROLLBACK` |

---

## 스키마 마이그레이션

### 버전 관리

- `app_settings` 테이블에 `schema_version` 키로 현재 버전 저장
- 앱 시작 시 `schema_version` 확인, 현재 코드 버전보다 낮으면 마이그레이션 실행

### 마이그레이션 파일 구조

```
src/adapters/storage/migrations/
  001_initial.ts        # Phase 1: job, category, time_entry, job_history, settings
  002_job_category.ts   # Phase 2: job_category, job_template, external_ref
  003_meta_registry.ts  # Phase 3: data_type, entity_type, data_field, Job.custom_fields ALTER TABLE
```

> **SQL DDL 문(CREATE TABLE 등)은 구현 시점에 작성**합니다. 이 설계 문서에서는 엔티티 속성과 제약만 정의하며, 실제 SQL은 마이그레이션 파일 내부에 구현합니다. 설계 변경이 구현 전에 발생할 수 있으므로, 조기에 SQL을 고정하지 않습니다.

### 실행 방식

- 각 마이그레이션은 `up()` 메서드 구현
- 순차 실행, 각 마이그레이션을 트랜잭션으로 래핑
- 실패 시 해당 마이그레이션 롤백, 앱 시작 중단 + 사용자에게 오류 알림

---

## OPFS iframe 제약 (검증 필요)

Logseq 플러그인은 iframe/webview 내에서 실행됩니다. Phase 2 착수 전에 다음을 검증해야 합니다.

### 알려진 제약

- OPFS 자체는 iframe에서 사용 가능하나, **storage partitioning**이 적용될 수 있음
- `createSyncAccessHandle()`은 **Web Worker 전용** — 메인 스레드에서 사용 불가
- sql.js WASM은 메인 스레드에서 동작 가능 (비동기 OPFS API 사용)

### 검증 체크리스트 (Phase 2 시작 전 필수)

- [ ] Logseq 플러그인 iframe 내에서 `navigator.storage.getDirectory()` 호출 가능 여부
- [ ] OPFS에 파일 쓰기/읽기 정상 동작 확인
- [ ] sql.js WASM 로드 정상 동작 확인
- [ ] 실패 시 fallback: IndexedDB 기반 sql.js 사용

### 리스크 대응 순서

Phase 2 시작 시 아래 순서로 검증하고, 실패 시 다음 단계로 이동:

1. **OPFS + sql.js WASM**: `navigator.storage.getDirectory()` + WASM 로드 (최적 경로)
2. **IndexedDB + sql.js WASM**: OPFS 실패 시 IndexedDB를 VFS로 사용
3. **IndexedDB + sql.js JS-only**: WASM 로드 실패 시 JS-only 빌드
4. **범위 재조정**: 모든 옵션 실패 시 사용자와 대안 논의

각 단계의 검증은 1시간 이내에 완료하며, 실패 즉시 다음 단계로 이동합니다.

### 멀티탭 동시 접근 대응

- Phase 2: Web Locks API (`navigator.locks.request('time-tracker-db', fn)`)로 배타적 접근
- Phase 3+: SharedWorker를 통한 단일 DB 접근점 (선택)

**Web Locks 상세 (Phase 2)**:

- 락 획득: `navigator.locks.request('time-tracker-db', { ifAvailable: true }, fn)`
- 타임아웃: 5초 후 자동 포기
- DB 쓰기 연산에만 락 적용 (읽기는 자유)

**Lock 실패 시 읽기 전용 모드**:

- 락 획득 실패 시: 토스트 알림 + **읽기 전용 모드** 자동 진입
- 읽기 전용 모드에서 **제한되는 동작**:
    - 타이머 시작/정지/일시정지 (버튼 비활성화)
    - Job 생성/수정/삭제
    - TimeEntry 생성/수정
- 읽기 전용 모드에서 **허용되는 동작**:
    - Job 목록 조회, TimeEntry 조회, 통계 확인
- **UI 표시**: 상단 배너 "다른 탭에서 실행 중 - 읽기 전용 모드"
- **자동 복구**: 5초 간격으로 락 재획득 시도. 성공 시 배너 제거 + 쓰기 기능 복원

---

## 데이터 백업 및 보내기

### 목적

브라우저 환경(OPFS)의 데이터 유실 위험(브라우저 변경, 캐시 삭제 등)에 대비합니다.

### 보내기 인터페이스

```typescript
interface IDataExporter {
    exportAll(): Promise<ExportData>;
    importAll(data: ExportData): Promise<ImportResult>;
}

interface ExportData {
    version: string;
    exported_at: string; // UTC ISO8601
    jobs: Job[];
    categories: Category[];
    time_entries: TimeEntry[];
    job_history: JobHistory[];
    job_categories: JobCategory[];
    job_templates: JobTemplate[];
    external_refs: ExternalRef[];
    data_fields: DataField[];
    settings: Record<string, unknown>;
}

interface ImportResult {
    success: boolean;
    imported_counts: Record<string, number>;
    errors: string[];
}
```

### 보내기 포맷

- **JSON 파일** (`.time-tracker-backup.json`)
- 전체 DB 덤프 (모든 테이블)
- 버전 필드로 포맷 호환성 관리

### 버전별 Import 마이그레이션

Export 파일의 `version` 필드를 기반으로, 현재 앱 버전과 다른 경우 단계적 마이그레이션을 수행합니다.

```typescript
type MigrationFn = (data: ExportData) => ExportData;

const EXPORT_MIGRATIONS: Record<string, MigrationFn> = {
    '0.1.0→0.2.0': (data) => {
        // job_category 테이블 추가 등
        return { ...data, job_categories: [] };
    },
    '0.2.0→0.3.0': (data) => {
        // custom_fields, data_fields 추가 등
        return { ...data, data_fields: [] };
    },
};

function migrateExportData(data: ExportData, target_version: string): ExportData {
    let current = data;
    // 버전 체인을 순회하며 순차 마이그레이션
    for (const [range, fn] of Object.entries(EXPORT_MIGRATIONS)) {
        if (shouldApply(current.version, range, target_version)) {
            current = fn(current);
        }
    }
    current.version = target_version;
    return current;
}
```

**원칙**: 어떤 이전 버전의 export 파일이든 현재 버전으로 import 가능. 마이그레이션 체인이 끊어지면 import 거부 + 사용자 알림.

### 구현 시점

- Phase 2 (SQLite 백엔드 구현 후)

### DB 손상 복구

1. 앱 시작 시 SQLite 무결성 검사 (`PRAGMA integrity_check`)
2. 실패 시 사용자에게 알림 + 마지막 export 파일에서 복구 제안
3. 자동 백업: 주기적으로 export (설정 가능, 기본 비활성)

### 저장 용량 모니터링 (Phase 2+)

- 앱 시작 시 `navigator.storage.estimate()`로 사용량 확인
- 사용률 80% 초과 시 토스트: "저장 공간이 부족합니다. 데이터보내기를 권장합니다."
- 보내기 완료 후 오래된 데이터 삭제 옵션 제공

---

## Logseq 플러그인 생명주기

> **dispose 패턴**: [02-architecture.md §14 서비스 리소스 정리](02-architecture.md) 참조

### 정상 종료

`beforeunload` 이벤트 또는 `logseq.beforeunload` 콜백에서:

> **iframe 제한**: Logseq 플러그인은 iframe 내에서 실행됩니다. `beforeunload`는 **메인 윈도우 이벤트**이므로 iframe에서 직접 감지하지 못할 수 있습니다. 이를 보완하기 위해: (1) `logseq.beforeunload` 콜백(Logseq API 제공)을 우선 사용하고, (2) 30초 주기적 백업을 fallback으로 병용합니다.

1. 진행 중 타이머 → `ActiveTimerState` 강제 저장 (`ISettingsRepository.setSetting`)
2. 현재 구간의 `accumulated_ms` 갱신 (최신 경과 시간 반영)
3. 미완료 TimeEntry는 생성하지 않음 (다음 로드 시 복구 플로우에서 처리)

### 비정상 종료 복구

앱 시작 시 복구 플로우:

```text
1. settingsRepo.getSetting('active_timer') 조회
2. 값이 존재하면:
   a. is_paused === true → TimerStore에 paused 상태 복원
   b. is_paused === false → started_at + accumulated_ms로 경과 시간 재계산
   c. UI에 "이전 세션에서 타이머가 실행 중이었습니다" 알림 표시
3. 값이 없으면 → 정상 초기 상태
```

### 플러그인 업데이트

- 코드 업데이트 시 `ActiveTimerState` 포맷이 변경될 수 있음
- 버전 필드를 `ActiveTimerState`에 포함하여 마이그레이션 처리
- 호환 불가 시: 기존 타이머 강제 종료 + 사용자 알림

### 30초 주기 백업

비정상 종료 시 데이터 손실 최소화를 위해, 타이머 실행 중 30초 간격으로 `ActiveTimerState`의 `accumulated_ms`를 갱신합니다.

---

## Storage Fallback 상세 설계

### Fallback 흐름

NFR-5.1에 따라 SQLite 접근 실패 시 MemoryAdapter로 자동 전환합니다.

```text
1. 앱 시작 시 SqliteUnitOfWork 초기화 시도
2. 실패 시 (StorageError):
   a. MemoryUnitOfWork로 전환
   b. 사용자에게 배너 알림: "저장소에 접근할 수 없어 임시 모드로 실행 중입니다. 데이터가 영구 저장되지 않습니다."
   c. 배너에 "재시도" 버튼 포함
3. 재시도 시:
   a. SqliteUnitOfWork 재초기화 시도
   b. 성공 시 → MemoryUoW의 현재 데이터를 SqliteUoW로 마이그레이션
   c. 실패 시 → 배너 유지, 사용자에게 "데이터 내보내기" 권장
4. 런타임 중 SQLite 쓰기 실패 시 (앱 시작은 정상이었지만 이후 오류):
   a. 3회 재시도 (exponential backoff: 500ms, 1s, 2s)
   b. 모든 재시도 실패 → MemoryAdapter로 자동 전환 + 배너 알림
   c. 전환 시 현재 세션의 미저장 데이터를 MemoryUoW에 보존
   d. 배경에서 30초 간격으로 SQLite 복구 시도
```

### Fallback 상태 관리

```typescript
interface StorageState {
    mode: 'sqlite' | 'memory_fallback';
    fallback_reason?: string;
    fallback_since?: string;
}
```

### 사용자 알림 요소

| 상황                 | UI                  | 내용                                                              |
| -------------------- | ------------------- | ----------------------------------------------------------------- |
| SQLite → Memory 전환 | 영구 배너 (warning) | "임시 모드: 데이터가 영구 저장되지 않습니다. [재시도] [내보내기]" |
| 재시도 성공          | 토스트 (success)    | "저장소가 복구되었습니다"                                         |
| 재시도 실패          | 토스트 (error)      | "저장소 복구에 실패했습니다. 데이터 내보내기를 권장합니다"        |

### Memory → SQLite 데이터 복구

재시도 성공 시 MemoryUoW에 축적된 데이터를 SqliteUoW로 이전합니다:

1. SqliteUoW.transaction() 내에서 모든 엔티티 upsert
2. 성공 시 MemoryUoW 해제, SqliteUoW로 전환
3. 실패 시 MemoryUoW 유지, 사용자에게 내보내기 권장

---

## 데이터 동기화 전략 (OPFS ↔ Logseq)

### Phase 4~5: 단방향 동기화 (OPFS → Logseq)

OPFS SQLite를 주 저장소(Source of Truth)로 사용하고, Logseq 그래프로 단방향 내보내기를 지원합니다.

**동기화 대상**:

| 엔티티    | Logseq 매핑         | 동기화 방향   |
| --------- | ------------------- | ------------- |
| Job       | 페이지 (properties) | OPFS → Logseq |
| TimeEntry | 블록 (properties)   | OPFS → Logseq |
| Category  | 페이지 태그         | OPFS → Logseq |

**동기화 시점**:

- 사용자가 명시적으로 "Logseq 동기화" 실행 시 (수동)
- 설정에서 자동 동기화 활성화 시: Job 상태 변경/TimeEntry 생성 후 자동 실행

**충돌 방지**:

- 단방향이므로 Logseq에서의 직접 수정은 다음 동기화 시 덮어쓰기
- `_internal_last_synced_at` property로 마지막 동기화 시점 추적

**향후 양방향 동기화 (Phase 5+)**:

- Logseq에서 Job property 변경 시 → OPFS 업데이트
- 충돌 해소: `updated_at` 비교, 최신 우선 또는 사용자 선택
- 양방향 동기화는 복잡도가 높으므로 Phase 5에서 종합 설계 (충돌 해소 전략, 동기화 큐, 오프라인 변경 추적 포함)

---

## 의식적 범위 제외

다음 항목은 현재 설계 범위에서 의도적으로 제외합니다.

| 항목                                | 이유                                      | 재검토 시점      |
| ----------------------------------- | ----------------------------------------- | ---------------- |
| 성능 모니터링/텔레메트리            | 개인 플러그인으로 수집 대상 사용자가 없음 | 필요 시          |
| 에러 리포팅 서비스 연동 (Sentry 등) | 개인 프로젝트, 로컬 로깅으로 충분         | 오픈소스 배포 시 |
| 동기화 충돌 해소 상세 설계          | Phase 5 양방향 동기화에서 종합 설계       | Phase 5          |
| API 문서 (OpenAPI 등)               | 외부 API를 제공하지 않음                  | eCount 연동 시   |
