# Phase 3B: DataField 스키마 & 서비스

## 목표

Migration 003으로 `data_type` / `entity_type` / `data_field` 테이블을 생성하고, `SqliteDataFieldRepository`를 스텁에서 실제 CRUD로 전환하며, `DataFieldService`를 구현합니다. Export 스키마에 `data_fields`를 포함하고 버전을 `0.3.0`으로 올립니다.

---

## 선행 조건

- Phase 2 완료 — SQLite 영속화, 마이그레이션 시스템 동작 (`001_initial` + `002_phase2`)
- `IDataFieldRepository` 인터페이스 정의 완료 (`adapters/storage/repositories.ts` L74–78)
- `DataType` / `EntityType` / `DataField` 타입 정의 완료 (`types/meta.ts`)

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `03-data-model.md` | §1.1~1.3 메타 레지스트리 | DataType, EntityType, DataField DDL 및 시드, `view_type` 규칙 |
| `02-architecture.md` | §4.3 DataFieldService | 커스텀 필드 등록/조회/삭제 |
| `05-storage.md` | §데이터 백업 | `ExportData` 확장 (`data_fields`) |
| `08-test-usecases.md` | UC-DFIELD | 커스텀 필드 테스트 유스케이스 (§2.9) |

---

## 생성/변경 파일 목록

모든 경로는 `packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `adapters/storage/sqlite/migrations/003_phase3.ts` | DDL + 시드 데이터 | 신규 |
| `adapters/storage/sqlite/migrations/index.ts` | 003 등록 | 변경 |
| `adapters/storage/sqlite/sqlite_data_field_repository.ts` | CRUD 구현 | 변경 (스텁→구현) |
| `services/data_field_service.ts` | DataFieldService | 신규 |
| `services/index.ts` | `createServices` 확장 | 변경 |
| `types/export.ts` | ExportData 확장 | 변경 |
| `services/data_export_service.ts` | export/import에 `data_fields` 추가, 버전 마이그레이션 | 변경 |

---

## 상세 구현 내용

### 1. Migration `003_phase3.ts` (DDL)

출처: `docs/time-tracker/03-data-model.md` §1.1~1.3.

```sql
CREATE TABLE IF NOT EXISTS data_type (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entity_type (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_field (
  id TEXT PRIMARY KEY,
  entity_type_id TEXT NOT NULL REFERENCES entity_type(id),
  data_type TEXT NOT NULL REFERENCES data_type(key),
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  view_type TEXT NOT NULL DEFAULT 'default',
  is_required INTEGER NOT NULL DEFAULT 0,
  is_system INTEGER NOT NULL DEFAULT 0,
  default_value TEXT,
  options TEXT,
  relation_entity_key TEXT,
  sort_order INTEGER,
  created_at TEXT NOT NULL,
  UNIQUE(entity_type_id, key)
);
```

- 기존 마이그레이션(`002_phase2.ts` 등)과 동일하게 `Migration` 객체의 `up(db)`에서 `db.exec(DDL)` 후 시드를 수행하는 패턴을 따릅니다.
- `version` 번호는 직전 마이그레이션 다음 정수(예: `3`)로 등록합니다.

### 2. 시드 데이터

**data_type** (7종):

| id | key | label |
| --- | --- | --- |
| dt-string | string | 텍스트 |
| dt-decimal | decimal | 소수 |
| dt-date | date | 날짜 |
| dt-datetime | datetime | 날짜+시간 |
| dt-boolean | boolean | 참/거짓 |
| dt-enum | enum | 선택 목록 |
| dt-relation | relation | 엔티티 참조 |

**entity_type** (5종):

| id | key | label |
| --- | --- | --- |
| et-job | job | 잡 |
| et-category | category | 카테고리 |
| et-time-entry | time_entry | 시간 기록 |
| et-job-history | job_history | 잡 히스토리 |
| et-job-template | job_template | 잡 템플릿 |

- `description`은 NULL 허용 컬럼이면 생략 가능.
- `created_at` / `entity_type.updated_at`은 ISO8601 문자열로 통일.
- 멱등 삽입: `INSERT OR IGNORE` 또는 동일 키 존재 시 스킵 정책을 마이그레이션에 명시합니다.

### 3. SqliteDataFieldRepository 활성화

현재 스텁(`sqlite_data_field_repository.ts`)을 실제 CRUD로 교체합니다.

- **`getDataFields(entity_type_id)`**: `SELECT * FROM data_field WHERE entity_type_id = ? ORDER BY sort_order` (NULL `sort_order` 정렬은 SQLite 규칙에 맞게 `ORDER BY sort_order IS NULL, sort_order` 등으로 조정 가능)
- **`upsertDataField(field)`**: `INSERT OR REPLACE` (또는 설계상 선호하는 upsert 패턴)로 저장
- **`deleteDataField(id)`**: `DELETE FROM data_field WHERE id = ?`
- 행 매핑: `row_mapper.ts`의 `mapRowToDataField()` (L146–162) 재사용

### 4. DataFieldService

#### 4.1 생성 파라미터 타입 (예시)

구현 시 `types/meta.ts`의 `DataTypeKey`와 정합성을 맞춥니다.

```typescript
interface CreateFieldParams {
  entity_type_id: string;
  data_type: DataTypeKey;
  key: string;
  label: string;
  view_type?: string;
  is_required?: boolean;
  default_value?: string;
  options?: string;
  relation_entity_key?: string;
  sort_order?: number;
}
```

#### 4.2 클래스 시그니처

```typescript
class DataFieldService {
  constructor(private uow: IUnitOfWork, private logger?: ILogger);

  async createField(params: CreateFieldParams): Promise<DataField>;
  async updateField(
    id: string,
    updates: Partial<
      Pick<DataField, 'label' | 'view_type' | 'sort_order' | 'is_required' | 'default_value' | 'options'>
    >,
  ): Promise<DataField>;
  async deleteField(id: string): Promise<void>;
  async getFieldsByEntity(entity_type_id: string): Promise<DataField[]>;
}
```

#### 4.3 핵심 로직 — `createField(params)`

1. `entity_type_id` 유효성: `entity_type`에 해당 `id` 존재 여부 확인 (시드 또는 `SELECT 1 FROM entity_type WHERE id = ?`)
2. `data_type` 유효성: `data_type` 테이블에 `key` 존재 여부 확인
3. `(entity_type_id, key)` 중복: 기존 필드 조회 후 존재 시 `ValidationError` (UC-DFIELD-003)
4. `view_type` 유효성: `data_type`별 허용 `view_type` 집합 검증 (`03-data-model.md` §1.3 표)

| DataType key | 선택 가능한 view_type |
| ------------ | ---------------------- |
| string | default, text, textarea, url, email |
| decimal | default, decimal, slider, currency |
| date | default, date_picker, calendar |
| datetime | default, datetime_picker |
| boolean | default, toggle, checkbox |
| enum | default, select, radio, chip |
| relation | default, entity_selector, inline_card |

5. `is_system = false` 고정 (사용자 생성 필드) — UC-DFIELD-001
6. `id = crypto.randomUUID()`, `created_at = now()` (ISO8601)
7. `uow.dataFieldRepo.upsertDataField(field)` 저장

#### 4.4 핵심 로직 — `updateField`

- 대상 필드 조회 후 없으면 오류
- `is_system === true`인 경우: 설계상 `key` / `data_type` / `entity_type_id` / `is_system` 변경 금지; `label`, `sort_order`, `view_type` 등만 허용 (`03-data-model.md` §1.3 제약과 일치)
- 갱신 후 `upsertDataField` 또는 부분 UPDATE 구현 선택

#### 4.5 핵심 로직 — `deleteField(id)`

1. 필드 존재 확인
2. `is_system === true`이면 `ValidationError` (메시지: 시스템 필드는 삭제 불가) — UC-DFIELD-002
3. `dataFieldRepo.deleteDataField(id)`

#### 4.6 `getFieldsByEntity`

- `dataFieldRepo.getDataFields(entity_type_id)` 위임

### 5. ExportData 확장 및 마이그레이션

- `ExportData.data`에 `data_fields: DataField[]` 추가
- `CURRENT_EXPORT_VERSION`을 `'0.3.0'`으로 갱신
- `EXPORT_MIGRATIONS`에 `'0.2.0'` 항목 추가: `data.data_fields = []` 병합 및 `version`을 `'0.3.0'`으로 상향
- `exportAll()`: `dataFieldRepo` 또는 동등한 조회 경로로 전체 `DataField` 수집 후 스냅샷에 포함 (다른 테이블과 FK 순서: `data_type` / `entity_type`은 시드이므로 export에 포함 여부는 `05-storage.md`와 일치시키되, 최소한 `data_fields` 배열은 명시)
- `importAll()`: 마이그레이션 적용 후 `data_field` 삽입 순서가 `entity_type`·`data_type`을 참조하므로, 해당 엔티티가 먼저 보장되는 순서로 문서화

### 6. createServices 확장

`services/index.ts`의 `createServices`에 `data_field_service` 인스턴스를 추가하고 반환 객체에 노출합니다. `AppContext` / `initialize` 연동이 필요하면 Phase 2F와 동일하게 타입·초기화 경로를 점검합니다.

### 7. UC 매핑: UC-DFIELD-001~003

| UC | 문서 위치 | Phase 3B 구현 대응 |
| --- | --- | --- |
| UC-DFIELD-001 | `08-test-usecases.md` §2.9 | `createField` — `is_system: false` 고정, enum 등 옵션 반영 |
| UC-DFIELD-002 | 동일 | `deleteField` — `is_system === true` 시 `ValidationError` |
| UC-DFIELD-003 | 동일 | `createField` — `(entity_type_id, key)` 유일성 검증 |

> **참고**: UC-DFIELD-002는 `is_system: true`인 필드(예: `"title"`)가 DB에 존재한다는 전제를 둡니다. 시스템 필드 시드가 003 DDL 범위에 포함되지 않으면, 테스트 픽스처에서 시드하거나 후속 서브페이즈에서 시스템 `DataField` 행 삽입 정책을 확정해야 합니다.

---

## 완료 기준

- [ ] `003_phase3.ts` 마이그레이션: `data_type`, `entity_type`, `data_field` 테이블 생성
- [ ] 시드 데이터: data_type 7종, entity_type 5종 INSERT
- [ ] `SqliteDataFieldRepository` 활성화 (`getDataFields`, `upsertDataField`, `deleteDataField`)
- [ ] `DataFieldService` 구현 (`createField`, `updateField`, `deleteField`, `getFieldsByEntity`)
- [ ] `createField`: entity_type / data_type 검증, `(entity_type_id, key)` 유일성, `view_type` 검증
- [ ] `deleteField`: `is_system` 보호
- [ ] `ExportData` 확장 (`data_fields` 추가, 버전 `0.3.0`)
- [ ] Export 마이그레이션 `0.2.0` → `0.3.0`
- [ ] `createServices`에 `data_field_service` 추가

---

## 다음 단계

→ **3F: 커스텀 필드 UI** (`FieldRenderer`, `CustomFieldEditor`, `CustomFieldManager`)

---

## 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
| ---- | ---- | ----------- |
| 메타 테이블(`data_type`, `entity_type`)을 DB 시드로 둔다 | `03-data-model.md`에서 Phase 3 DB 시드 테이블 구현을 명시; `DataField` FK 무결성 검증 용이 | 코드 상수만 두고 FK는 앱 레벨 검증만 수행 |
| `upsertDataField`에 `INSERT OR REPLACE` 사용 | SQLite 관례 및 구현 단순화; 기존 마이그레이션 스타일과 정합 | `ON CONFLICT DO UPDATE` 별도 분기 |
| Export 버전을 `0.3.0`으로 상향 | `data_fields` 추가는 하위 호환 breaking이 아니나 스키마 버전으로 import 마이그레이션 체인 관리 | 패치만 올리고 마이그레이션 없이 optional 필드 처리 (문서·검증 복잡도 증가) |

---

## 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
| ---- | --------- | ------ |
| UC-DFIELD-002는 시스템 `DataField` 행이 존재한다는 전제인데, 본 문서의 시드는 `data_type`/`entity_type`만 포함 | (가) 003에서 job 등용 시스템 `DataField` 시드 추가, (나) 테스트에서만 픽스처 삽입 — 택일 후 `08-test-usecases`와 구현을 맞춤 | minor |
| `export_schema`(Zod)에 `data_fields` 반영 필요 | `types/export_schema.ts` 변경 및 `validateExportData` 갱신을 생성/변경 목록에 추가 검토 | minor |
| `types/meta.ts`의 `description` 등 optional과 DB NULL 정책 정합 | `mapRowToDataField` 및 INSERT 시 NULL/빈 문자열 규약 통일 | minor |
