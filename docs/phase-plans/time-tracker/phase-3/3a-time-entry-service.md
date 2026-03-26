# Phase 3A: TimeEntryService

## 목표

수동 TimeEntry CRUD와 overlap 감지·해결 로직을 구현합니다. 동일 Job 내에서만 겹침을 검사하며, `new_first` / `existing_first` 전략에 따라 구간 조정·분할·삭제를 수행합니다.

---

## 선행 조건

- Phase 2 완료 — SQLite 영속화 + 전체 Job CRUD 동작
- TimeEntry Repository 인터페이스 구현 완료 (Phase 2)

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `02-architecture.md` | §4.9 TimeEntryService | 수동 TimeEntry CRUD, overlap 검사 |
| `04-state-management.md` | §TimeEntry overlap 정책 | 겹침 감지 + 사용자 선택 (조정/유지) |
| `03-data-model.md` | §TimeEntry | TimeEntry 엔티티 정의 |
| `09-user-flows.md` | UF-14 | 수동 TimeEntry 생성 사용자 플로우 |
| `08-test-usecases.md` | UC-ENTRY | TimeEntry 관련 테스트 유스케이스 |
| `06-ui-ux.md` | OverlapResolutionModal | `resolveOverlap` 전략과 UI 연동 |

---

## 생성/변경 파일 목록

`packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `services/time_entry_service.ts` | 수동 TimeEntry CRUD + overlap 검사·해결 | 신규 |
| `services/index.ts` | `createServices` 확장, export 추가 | 변경 |

---

## 상세 구현 내용

### 1. 공개 인터페이스 (`02-architecture.md` §4.9)

```typescript
interface ITimeEntryService {
  createManualEntry(params: ManualEntryParams): Promise<TimeEntry>;
  detectOverlaps(
    job_id: string,
    started_at: string,
    ended_at: string,
    exclude_id?: string,
  ): Promise<TimeEntry[]>;
  resolveOverlap(
    new_entry: TimeEntry,
    existing: TimeEntry[],
    strategy: 'new_first' | 'existing_first',
  ): Promise<TimeEntry[]>;
  updateEntry(
    id: string,
    updates: Partial<Pick<TimeEntry, 'started_at' | 'ended_at' | 'note' | 'category_id'>>,
  ): Promise<TimeEntry>;
  deleteEntry(id: string): Promise<void>;
}

interface ManualEntryParams {
  job_id: string;
  category_id: string;
  started_at: string;
  ended_at: string;
  note?: string;
}
```

```typescript
class TimeEntryService implements ITimeEntryService {
  constructor(private uow: IUnitOfWork, private logger?: ILogger);
  // ...
}
```

---

### 2. `createManualEntry(params)`

**핵심 로직**

1. `jobRepo.getJobById(job_id)` — 존재 검증 (없으면 `ValidationError`)
2. `categoryRepo.getCategoryById(category_id)` — 존재 검증
3. `ended_at >= started_at` 검증 (위반 시 `ValidationError`; 동일 시각은 허용 여부는 데이터 모델·제품 정책에 맞춤, 기본은 `>=`로 0초 구간 허용 가능)
4. `duration_seconds = Math.floor((Date.parse(ended_at) - Date.parse(started_at)) / 1000)`
5. `note`가 있으면 `sanitizeText(note)` 적용
6. `is_manual = true` 설정
7. `id = crypto.randomUUID()`, `created_at` / `updated_at` = `new Date().toISOString()` (UTC ISO8601)
8. `timeEntryRepo.upsertTimeEntry(entry)` 로 저장

---

### 3. `detectOverlaps(job_id, started_at, ended_at, exclude_id?)`

**정책** (`04-state-management.md`): **동일 Job 내 수동 입력만** 대상 (교차 Job overlap은 허용).

**핵심 로직**

1. `timeEntryRepo.getTimeEntries({ job_id })` 로 해당 Job의 엔트리 조회
2. 결과 중 **`is_manual === true`** 인 항목만 overlap 판정 대상으로 필터
3. 각 기존 엔트리에 대해 구간 겹침:  
   `existing.started_at < ended_at && existing.ended_at > started_at`
4. `exclude_id`가 있으면 해당 `id` 행은 제외 (수정 시 자기 자신 제외)
5. 겹치는 엔트리 배열 반환

---

### 4. `resolveOverlap(new_entry, existing[], strategy)`

겹침이 있는 `existing` 각각에 대해 전략별로 조정합니다. 실제 호출부(UI)에서는 보통 단일 겹침 또는 순차 처리 흐름과 맞추되, 서비스 API는 배열 단위로 명세합니다. 모든 조정·생성 후 **`duration_seconds` 재계산**, 기간이 **0초 이하**이면 해당 엔트리는 **저장하지 않거나 삭제**합니다.

#### 4.1 `strategy === 'new_first'`

새 엔트리를 우선 유지하고 기존을 조정합니다.

| Case | 조건(개념) | 처리 |
| --- | --- | --- |
| 1 | 부분 중복 — 기존 구간이 새 종료 이후까지 연장 | 기존 `started_at = new.ended_at` 으로 조정 (뒤쪽만 남김) |
| 2 | 부분 중복 — 기존 구간이 새 시작 이전까지 연장 | 기존 `ended_at = new.started_at` 으로 조정 (앞쪽만 남김) |
| 3 | 기존이 새 구간에 **완전 포함** | 기존 행 삭제 |
| 4 | 기존이 새를 **완전 포함** | 기존을 2개로 분할: 앞 `기존.started_at ~ new.started_at`, 뒤 `new.ended_at ~ 기존.ended_at` (각각 `duration_seconds` 재계산 후 0초 초과만 유지) |

경계(접촉만 함)는 overlap 정책에 따라 제외할 수 있음 — `detectOverlaps`와 동일한 엄격한 부등호 기준을 유지합니다.

#### 4.2 `strategy === 'existing_first'`

기존을 우선 유지하고 새 엔트리를 조정·취소·분할합니다.

| Case | 조건(개념) | 처리 |
| --- | --- | --- |
| 1 | 부분 중복 | 새 엔트리에서 기존과 겹치는 구간을 제거(한쪽 또는 양쪽 잘림에 따라 하나 또는 두 구간으로 재구성) |
| 2 | 새 엔트리가 기존에 **완전 포함** | 새 엔트리 생성 취소(호출 규약: 아직 저장 전 `new_entry`만 넘긴 뒤 취소, 또는 저장 후 삭제 — 구현 시 단일 트랜잭션 내에서 일관되게) |
| 3 | 기존이 새를 **부분 포함** | 새 엔트리 양쪽이 잘릴 수 있음 → 최대 **2개**의 비겹침 구간으로 분리해 저장 |

- 모든 조정 후 각 엔트리의 `duration_seconds` 재계산
- 조정 결과 구간 길이가 0초 이하면 삭제하거나 생성하지 않음

---

### 5. `updateEntry(id, updates)`

**핵심 로직**

1. `timeEntryRepo.getTimeEntryById(id)` 등으로 존재 확인 (없으면 `NotFoundError` 또는 프로젝트 표준 에러)
2. `started_at` / `ended_at`가 바뀌면 병합 후 `ended_at >= started_at` 검증 및 `duration_seconds` 재계산
3. `note` 변경 시 `sanitizeText` 적용
4. `updated_at = new Date().toISOString()`
5. 저장소 갱신 (`updateTimeEntry` 등 기존 Repository 계약 준수)
6. (선택) 시간 구간 변경 시 동일 Job 내 `detectOverlaps` 호출 여부는 제품 정책에 따름 — Phase 3E UI에서 UF-14와 함께 확정 가능; 서비스 레벨에서는 **겹침 검사 API를 분리**해 두고 호출자가 결정하는 구조를 권장

---

### 6. `deleteEntry(id)`

**핵심 로직**

1. 존재 검증 후 `timeEntryRepo.deleteTimeEntry(id)` (또는 동등 API)
2. 없는 `id`는 `NotFoundError` 등으로 명시적 실패(또는 멱등 삭제 — 팀 컨벤션에 맞춤)

---

### 7. `createServices` 확장

```typescript
const time_entry_service = new TimeEntryService(uow, logger);
```

- **의존성**: 다른 애플리케이션 서비스에 의존하지 않음 (`uow` + `logger`만)
- **초기화 순서**: 기존 서비스 인스턴스 생성 후 추가
- 반환 객체에 `time_entry_service` 필드 추가 및 barrel export

---

### 8. UC 매핑 (`08-test-usecases.md`)

| UC ID | 설명 (개략) |
| --- | --- |
| UC-ENTRY-001 | 수동 TimeEntry 생성 — 검증·저장 |
| UC-ENTRY-002 | 동일 Job 내 overlap 감지 |
| UC-ENTRY-003 | `new_first` / `existing_first` 해결 시나리오 |
| UC-ENTRY-004 | 수정·삭제 및 `duration_seconds`·타임스탬프 정합성 |

---

## 완료 기준

- [ ] `TimeEntryService` 클래스 구현 (`createManualEntry`, `detectOverlaps`, `resolveOverlap`, `updateEntry`, `deleteEntry`)
- [ ] `createManualEntry`: job/category 존재 검증, 시간 범위 검증, `duration` 자동 계산
- [ ] `detectOverlaps`: 동일 Job 내 overlap 감지, `is_manual` 필터, `exclude_id` 지원
- [ ] `resolveOverlap` `new_first`: 4가지 케이스 (부분 중복 2종, 완전 포함 삭제, 분할)
- [ ] `resolveOverlap` `existing_first`: 3가지 케이스 (부분 중복, 완전 포함 취소, 양측 잘림·분할)
- [ ] 모든 조정 후 `duration_seconds` 재계산, 0초 이하 구간 제거
- [ ] `createServices`에 `time_entry_service` 추가
- [ ] 모든 타임스탬프 UTC ISO8601

---

## 다음 단계

→ **3E: 수동 TimeEntry UI** (`ManualEntryForm`, `TimeEntryList`, `OverlapResolutionModal`)
