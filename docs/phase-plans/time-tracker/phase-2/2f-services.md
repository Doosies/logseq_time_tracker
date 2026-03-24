# Phase 2F: Phase 2 서비스 (JobCategory · 데이터보내기)

## 목표

`JobCategoryService`, `DataExportService`를 구현하고, `createServices` 팩토리를 확장합니다. Phase 1에서 생략했던 `CategoryService`의 삭제 시 참조 검사를 활성화합니다.

---

## 선행 조건

- Phase 2B 완료 — DDL에 `external_ref`, `job_category`, `job_template` 테이블이 존재하고, 이에 대응하는 Repository 계약이 갖춰짐

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `02-architecture.md` | §4.3 Services | `JobCategoryService`, `DataExportService` 책임 범위 |
| `02-architecture.md` | §8 서비스 초기화 | `createServices` 팩토리, 초기화·의존성 순서 |
| `05-storage.md` | §데이터 백업 | `ExportData` 형식, export/import, 버전 마이그레이션 |
| `03-data-model.md` | §2.5 JobCategory | `(job_id, category_id)` 유일 제약, 동일 Job 내 `is_default` 유일성 |
| `03-data-model.md` | §2.2 Category | 삭제 시 참조 검사 (`TimeEntry`, `JobCategory`) |

---

## 생성/변경 파일 목록

`packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `services/job_category_service.ts` | Job–Category M:N 링크·기본 카테고리 관리 | 신규 |
| `services/data_export_service.ts` | JSON 전체 export / import | 신규 |
| `services/category_service.ts` | 삭제 시 참조 검사 활성화 | 변경 |
| `services/index.ts` | 신규 서비스 export, `createServices` 반환 확장 | 변경 |
| `types/export.ts` | `ExportData`, `ImportResult` 타입 | 신규 |
| `types/export_schema.ts` | Zod 런타임 스키마 및 `validateExportData` (import 전 구조·필드 검증) | 신규 |
| `app/initialize.ts` | `createServices` 반환 구조 확장에 따른 `AppContext` 연동·초기화 점검 | 변경 |

---

## 상세 구현 내용

### 1. JobCategoryService

```typescript
class JobCategoryService {
  constructor(private uow: IUnitOfWork, private logger?: ILogger);

  async linkJobCategory(job_id: string, category_id: string, is_default?: boolean): Promise<JobCategory>;
  async unlinkJobCategory(id: string): Promise<void>;
  async getJobCategories(job_id: string): Promise<JobCategory[]>;
  async getCategoryJobs(category_id: string): Promise<JobCategory[]>;
  async setDefaultCategory(job_id: string, category_id: string): Promise<void>;
}
```

**핵심 로직**

- **`linkJobCategory`**: `(job_id, category_id)` 조합 중복 검사 후 없으면 삽입, 있으면 갱신(upsert). `is_default`가 `true`로 요청되면 동일 Job 내 다른 행의 `is_default`를 정리하는 정책과 일치시키거나, 별도로 `setDefaultCategory`만 사용하도록 문서·호출 규약을 고정합니다.
- **`setDefaultCategory`** (트랜잭션 내 원자적 수행):
  1. 해당 `job_id`에서 `is_default === true`인 레코드를 모두 `false`로 변경
  2. 대상 `(job_id, category_id)` 행을 `is_default === true`로 변경 (링크가 없으면 먼저 링크 생성 또는 명시적 오류)
  3. 위 단계를 단일 `uow.transaction`으로 묶어 중간 실패 시 롤백

**데이터 모델 정합성** (`03-data-model.md` §2.5): 동일 Job당 기본 카테고리는 최대 하나. DB 유니크 인덱스와 서비스 로직이 모순되지 않게 합니다.

---

### 2. DataExportService

```typescript
interface ExportData {
  version: string;      // 앱/스키마 버전 (예: '0.2.0')
  exported_at: string;  // UTC ISO8601
  data: {
    jobs: Job[];
    categories: Category[];
    time_entries: TimeEntry[];
    job_history: JobHistory[];
    job_categories: JobCategory[];
    job_templates: JobTemplate[];
    external_refs: ExternalRef[];
    settings: Record<string, unknown>;
  };
}

interface ImportResult {
  success: boolean;
  imported_counts: Record<string, number>;
  errors: string[];
}

class DataExportService {
  constructor(private uow: IUnitOfWork, private logger?: ILogger);

  async exportAll(): Promise<ExportData>;
  async importAll(data: ExportData): Promise<ImportResult>;
}
```

**`exportAll()`**

1. `IUnitOfWork`에 연결된 각 Repository에서 관련 엔티티 전량 조회
2. 위 `ExportData.data` 필드에 맞게 조합
3. `version`은 현재 앱(또는 export 스키마) 버전으로 설정, `exported_at`은 `new Date().toISOString()` 등 UTC 기준

**`importAll(data)`**

1. 진입 직후 **`validateExportData(data)`**(`types/export_schema.ts`)로 Zod 런타임 검증을 수행합니다. 스키마에 맞지 않으면 `ValidationError` 등으로 중단되고, 서비스 구현에서는 이를 잡아 `ImportResult.success === false` 및 `errors`에 메시지를 담습니다.
2. `data.version` 확인 후 필요 시 아래 **Export 버전 마이그레이션** 체인 적용
3. 단일 트랜잭션 내에서:
   - 기존 데이터 전체 삭제(권장: FK 순서 역으로) 또는 설계상 허용되는 upsert 전략
   - 삽입 순서: **Category → Job → TimeEntry → JobHistory → ExternalRef → JobCategory → JobTemplate** (`05-storage.md` 및 FK 의존성 준수)
   - `settings`는 FK가 없으나 앱 일관성을 위해 고정 순서(예: 테이블 데이터 삽입 후 settings 반영)로 문서화
4. 테이블(또는 논리 단위)별로 `imported_counts` 집계
5. 예외 시 전체 **ROLLBACK**, `ImportResult.success === false`, `errors`에 메시지 수집

**Export 버전 마이그레이션**

소스 버전을 **키**로 두고, `CURRENT_EXPORT_VERSION`과 같아질 때까지 `while` 루프에서 한 단계씩 적용합니다(`data_export_service.ts`의 `migrateExportData`).

```typescript
const CURRENT_EXPORT_VERSION = '0.2.0';

type ExportMigrationFn = (data: ExportData) => ExportData;

const EXPORT_MIGRATIONS: Record<string, ExportMigrationFn> = {
  '0.1.0': (data) => ({
    ...data,
    version: '0.2.0',
    data: {
      ...data.data,
      job_categories: [],
      job_templates: [],
      external_refs: [],
    },
  }),
};

function migrateExportData(data: ExportData): ExportData {
  let current: ExportData = structuredClone(data);
  while (current.version !== CURRENT_EXPORT_VERSION) {
    const fn = EXPORT_MIGRATIONS[current.version];
    if (!fn) {
      throw new ValidationError(`Unsupported export version: ${current.version}`, 'version');
    }
    current = fn(current);
  }
  return current;
}
```

(`ValidationError`는 `../errors`에서 import합니다.)

- 각 마이그레이션 함수는 **다음** 스키마에 맞게 `version` 필드를 갱신합니다(예: `'0.1.0'` → 함수 실행 후 `'0.2.0'`).
- 알 수 없는 `version` 키는 `ValidationError`로 중단되고, `importAll`이 `ImportResult.errors`에 메시지를 담습니다.

타입 정의는 `types/export.ts`에 두고, 서비스 및 테스트에서 import합니다. Zod 런타임 스키마와 `validateExportData`는 `types/export_schema.ts`에 둡니다.

---

### 3. CategoryService 참조 검사 활성화

Phase 1에서는 저장소가 휘발성이어 참조 검사를 생략했으나, Phase 2에서는 `deleteCategory(id)`에 다음을 적용합니다.

1. **TimeEntry**: 해당 `category_id`를 참조하는 행이 있으면 `ReferenceIntegrityError` throw (`packages/time-tracker-core/src/errors/base.ts`의 기존 클래스 활용)
2. **JobCategory**: 해당 `category_id`를 참조하는 행이 있으면 `ReferenceIntegrityError` throw
3. **하위 카테고리**: `parent_id === id`인 Category가 존재하면 삭제 거부(기존 Phase 1 동작 유지)
4. 위 조건을 모두 통과하면 삭제 허용

Repository에 `existsByCategoryId` 류의 조회가 없으면 Phase 2C/저장소 계층에 쿼리를 추가합니다.

---

### 4. createServices 확장

```typescript
function createServices(uow: IUnitOfWork, logger?: ILogger) {
  // Phase 1 (기존)
  const history_service = new HistoryService(uow, logger);
  const job_service = new JobService(uow, history_service, logger);
  const category_service = new CategoryService(uow, logger);
  const timer_service = new TimerService(uow, job_service, logger);

  // Phase 2 (신규)
  const job_category_service = new JobCategoryService(uow, logger);
  const data_export_service = new DataExportService(uow, logger);

  return {
    history_service,
    job_service,
    category_service,
    timer_service,
    job_category_service,
    data_export_service,
  };
}
```

- 구현 위치: `services/index.ts`의 `createServices` 본문
- `app/initialize.ts`는 기존처럼 `createServices(uow, logger)` 호출만 하면 반환 객체에 신규 필드가 포함되므로, `AppContext` 타입(`app/context.ts`)의 `services` 형이 확장되는지 확인하고 필요 시 수정합니다.

---

## 완료 기준

- [x] `JobCategoryService` 구현 (`link` / `unlink` / `get*` / `setDefaultCategory`)
- [x] 동일 Job 내 `is_default` 유일성 보장 (트랜잭션 + DB 제약과 일치)
- [x] `DataExportService.exportAll()` — 전체 데이터 JSON 스냅샷
- [x] `DataExportService.importAll()` — 트랜잭션 내 전체 import 및 실패 시 롤백
- [x] Export 버전 마이그레이션 (`EXPORT_MIGRATIONS` 출발 버전 키 + `migrateExportData` `while` 루프)
- [x] `CategoryService.deleteCategory()` 참조 검사 활성화 (`TimeEntry`, `JobCategory`, 하위 카테고리)
- [x] `createServices`에 Phase 2 서비스 추가 및 barrel export
- [x] `ExportData`, `ImportResult` 타입 정의 (`types/export.ts`)

---

## 다음 단계

→ **2G: 테스트** (서비스·마이그레이션·참조 무결성 단위·통합 테스트)
