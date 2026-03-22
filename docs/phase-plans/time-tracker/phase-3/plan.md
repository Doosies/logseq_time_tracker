# Phase 3: UI 고도화 & 커스텀 필드

## 목표

툴바/풀화면/인페이지 UI 모드를 구현하고, 셀렉터/데이트피커 등 고급 컴포넌트를 추가하며, 수동 TimeEntry CRUD와 커스텀 필드(DataField) 시스템을 구현합니다.

---

## 선행 조건

- Phase 2 완료 — SQLite 영속화 + 전체 Job CRUD 동작

---

## 참조 설계 문서

| 문서                     | 섹션                    | 참조 내용                                                |
| ------------------------ | ----------------------- | -------------------------------------------------------- |
| `06-ui-ux.md`            | §Logseq 통합 UI 개요    | 툴바(Compact), 풀화면(Full), 인페이지(Inline) 3가지 모드 |
| `06-ui-ux.md`            | §Core UI 컴포넌트 분기  | 모드별 렌더링 전략                                       |
| `06-ui-ux.md`            | §셀렉터                 | CategorySelector, JobSelector 커스텀 select              |
| `06-ui-ux.md`            | §데이트피커             | DatePicker + TimeRangePicker                             |
| `06-ui-ux.md`            | §OverlapResolutionModal | TimeEntry 겹침 해결 UI                                   |
| `06-ui-ux.md`            | §수동 TimeEntry         | 사용자 직접 TimeEntry 생성/수정/삭제                     |
| `06-ui-ux.md`            | §반응형 레이아웃        | Compact / Full 모드 전환 기준                            |
| `04-state-management.md` | §TimeEntry overlap 정책 | 겹침 감지 + 사용자 선택 (조정/유지)                      |
| `03-data-model.md`       | §3~6 메타 레지스트리    | DataType, EntityType, DataField 정의                     |
| `02-architecture.md`     | §4.9 TimeEntryService   | 수동 TimeEntry CRUD, overlap 검사                        |
| `02-architecture.md`     | §4.3 DataFieldService   | 커스텀 필드 등록/조회/삭제                               |
| `08-test-usecases.md`    | §Phase 3 유즈케이스     | 수동 TimeEntry, overlap, 커스텀 필드                     |
| `09-user-flows.md`       | UF-11 ~ UF-14           | 수동 기록, 커스텀 필드, UI 모드 전환                     |

---

## 서브 단계

### 3A: UI 모드 시스템

| 컴포넌트                | 역할                                           |
| ----------------------- | ---------------------------------------------- |
| `Toolbar.svelte`        | 상단 슬롯바 — 현재 타이머 요약 + 빠른 제어     |
| `FullView.svelte`       | 메인 패널 — Job 목록 + 타이머 + TimeEntry 이력 |
| `InlineView.svelte`     | 특정 Job 페이지 내 인라인 UI (블록 참조 시)    |
| `LayoutSwitcher.svelte` | Compact ↔ Full 모드 전환                       |

**모드 전환 기준**:

- 툴바: Logseq 상단 슬롯 (항상 표시)
- 풀화면: 툴바 클릭 시 패널 오픈
- 인페이지: Logseq 페이지 내 블록 렌더러

### 3B: 고급 셀렉터

| 컴포넌트                  | 역할                                      |
| ------------------------- | ----------------------------------------- |
| `CategorySelector.svelte` | 트리 구조 카테고리 선택 (검색 + 드롭다운) |
| `CategorySelector.css.ts` | 스타일                                    |
| `JobSelector.svelte`      | Job 선택 (검색 + 상태 필터 + 드롭다운)    |
| `JobSelector.css.ts`      | 스타일                                    |
| `DatePicker.svelte`       | 날짜 선택                                 |
| `DatePicker.css.ts`       | 스타일                                    |
| `TimeRangePicker.svelte`  | 시작/종료 시간 범위 선택                  |
| `TimeRangePicker.css.ts`  | 스타일                                    |

### 3C: TimeEntryService + 수동 TimeEntry UI

| 파일                                       | 역할                               |
| ------------------------------------------ | ---------------------------------- |
| `services/time_entry_service.ts`           | 수동 TimeEntry CRUD + overlap 검사 |
| `components/ManualEntryForm.svelte`        | 수동 TimeEntry 생성 폼             |
| `components/TimeEntryList.svelte`          | TimeEntry 이력 목록 (필터링, 정렬) |
| `components/OverlapResolutionModal.svelte` | 겹침 해결 UI (조정/유지 선택)      |

**TimeEntryService 핵심**:

- `createManualEntry(params)`: 시간 범위 검증 + overlap 검사
- `updateEntry(id, updates)`: 수정 후 재검증
- `deleteEntry(id)`: 삭제
- `checkOverlap(job_id, start, end)`: 기존 TimeEntry와 겹침 확인

**Overlap 해결 정책** (04-state-management.md):

1. 겹침 감지 → OverlapResolutionModal 표시
2. 사용자 선택: "기존 항목 시간 조정" 또는 "그대로 유지"
3. 조정 선택 시: 기존 TimeEntry의 end 시간을 새 항목의 start로 조정

### 3D: DataField (커스텀 필드)

| 파일                                                      | 역할                        |
| --------------------------------------------------------- | --------------------------- |
| `services/data_field_service.ts`                          | DataField 등록/조회/삭제    |
| `adapters/storage/sqlite/sqlite_data_field_repository.ts` | SQL 구현                    |
| `components/CustomFieldEditor.svelte`                     | 커스텀 필드 값 입력/표시 UI |
| `components/CustomFieldManager.svelte`                    | 커스텀 필드 정의 관리 UI    |

**DataField 구조** (03-data-model.md):

- `DataType`: 텍스트, 숫자, 날짜, 불리언, 선택 목록
- `EntityType`: Job, TimeEntry
- `DataField`: entity_type + data_type + name + options(JSON)
- Job/TimeEntry의 `custom_fields` JSON 컬럼에 값 저장

### 3E: 테스트

| 테스트                        | 범위                      |
| ----------------------------- | ------------------------- |
| TimeEntryService 단위 테스트  | 수동 CRUD, overlap 검사   |
| OverlapResolution 통합 테스트 | 겹침 감지 → 조정/유지     |
| DataFieldService 단위 테스트  | 필드 CRUD, JSON 파싱      |
| 셀렉터 컴포넌트 테스트        | 검색, 선택, 키보드 접근성 |
| UI 모드 전환 테스트           | Compact → Full → Inline   |

---

## 완료 기준

- [ ] 툴바 / 풀화면 / 인페이지 3개 UI 모드 구현
- [ ] CategorySelector, JobSelector, DatePicker, TimeRangePicker
- [ ] TimeEntryService + 수동 TimeEntry CRUD
- [ ] Overlap 검사 + OverlapResolutionModal
- [ ] DataField 시스템 (정의 + 값 저장/조회)
- [ ] 전체 테스트 통과 + 커버리지 80%+
- [ ] a11y: 키보드 내비게이션, aria 속성

---

## 다음 단계

→ Phase 4: 잡 생성 & 템플릿 (`phase-4/plan.md`)
