# Phase 3E: 수동 TimeEntry UI

## 목표

`ManualEntryForm`, `TimeEntryList`, `OverlapResolutionModal` UI 컴포넌트를 구현합니다. 수동 TimeEntry 생성·겹침 해결·이력 목록 표시를 한 흐름으로 연결합니다.

---

## 선행 조건

- **3A**: `TimeEntryService` 완료 — `createManualEntry`, `detectOverlaps`, `resolveOverlap`
- **3D**: 셀렉터·데이트피커 완료 — `CategorySelector`, `JobSelector`, `TimeRangePicker`

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `06-ui-ux.md` | §수동 TimeEntry 입력 | `ManualEntryForm` UI 구조 |
| `06-ui-ux.md` | §OverlapResolutionModal | 겹침 해결 UI |
| `06-ui-ux.md` | §빈 상태 UI | `TimeEntryList` 빈 상태 |
| `09-user-flows.md` | UF-14 | 수동 TimeEntry 생성 사용자 플로우 |
| `08-test-usecases.md` | UC-UI-013~018 | 수동 TimeEntry UI 테스트 유스케이스 |

---

## 생성/변경 파일 목록

`packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `components/ManualEntryForm/ManualEntryForm.svelte` | 수동 TimeEntry 생성 폼 | 신규 |
| `components/ManualEntryForm/manual_entry_form.css.ts` | 스타일 | 신규 |
| `components/TimeEntryList/TimeEntryList.svelte` | TimeEntry 이력 목록 | 신규 |
| `components/TimeEntryList/time_entry_list.css.ts` | 스타일 | 신규 |
| `components/OverlapResolutionModal/OverlapResolutionModal.svelte` | 겹침 해결 모달 | 신규 |
| `components/OverlapResolutionModal/overlap_resolution_modal.css.ts` | 스타일 | 신규 |
| `components/index.ts` | barrel export 추가 | 변경 |

---

## 상세 구현 내용

구현 시 **Svelte 5 Runes**(`$state`, `$derived`, `$effect` 등)를 사용합니다. 서비스 호출은 `AppContext`에서 주입된 `TimeEntryService` 등을 통해 수행합니다.

### 1. ManualEntryForm.svelte

출처: `06-ui-ux.md` §수동 TimeEntry 입력.

**Props**

```typescript
interface ManualEntryFormProps {
  context: AppContext;
  jobs: Job[];
  categories: Category[];
  onSubmit: (entry: TimeEntry) => void;
  onCancel: () => void;
}
```

**UI 구조**

1. `JobSelector` (필수)
2. `CategorySelector` (필수)
3. `TimeRangePicker` (`started_at` + `ended_at`, 필수)
4. 메모 `textarea` (선택)
5. Submit 버튼 (로딩 상태 지원)
6. Cancel 버튼

**동작 플로우** (출처: `09-user-flows.md` UF-14)

1. 입력값 검증 — Job/Category 선택, 시간 범위 유효성
2. `TimeEntryService.detectOverlaps(job_id, started_at, ended_at)` 호출
3. **overlap 없음** → `TimeEntryService.createManualEntry(params)` → 성공 토스트 → 필요 시 부모에 `onSubmit` 통지 → 폼 초기화
4. **overlap 있음** → `OverlapResolutionModal` 표시; 사용자가 전략 선택 시 `resolveOverlap` 등 설계된 API에 맞춰 처리 후 동일 성공 경로

```svelte
<script lang="ts">
  // 예: 로컬 상태는 $state, 파생 UI는 $derived
  let is_submitting = $state(false);
  // ... Job/Category/시간 범위 바인딩
</script>
```

---

### 2. TimeEntryList.svelte

**Props**

```typescript
interface TimeEntryListProps {
  entries: TimeEntry[];
  jobs: Job[];
  categories: Category[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

**기능**

- `TimeEntry` 목록 표시 — `started_at` 기준 **내림차순** 정렬 (`$derived`로 정렬 결과 유지)
- 각 항목: Job title, Category name, 시작~종료, duration 표시
- 기간 필터 — `DatePicker`로 `from` / `to` (설계상 컴포넌트명이 다르면 3D 산출물에 맞춤)
- Job 필터 — `JobSelector` (단일 선택 또는 “전체” 옵션은 UX 문서와 일치)
- 편집/삭제 액션 — `onEdit`, `onDelete` 콜백
- 빈 상태 — `06-ui-ux.md` §빈 상태 UI: **「기록된 시간이 없습니다」**

---

### 3. OverlapResolutionModal.svelte

출처: `06-ui-ux.md` §OverlapResolutionModal.

**Props**

```typescript
interface OverlapResolutionModalProps {
  new_entry: { started_at: string; ended_at: string; job_id: string };
  overlapping: TimeEntry[];
  onResolve: (strategy: 'new_first' | 'existing_first') => void;
  onCancel: () => void;
}
```

**UI 구조**

- 시각적 타임라인 — 색상 구분: 새 구간=파랑, 기존=회색, 중복(겹침)=빨강
- 중복 구간 정보 텍스트 (시각·숫자 요약)
- **「현재 입력 우선」** 버튼 → `onResolve('new_first')`
- **「기존 입력 우선」** 버튼 → `onResolve('existing_first')`
- 취소 버튼 → `onCancel()`
- 포커스 트랩 — `ReasonModal`과 동일 패턴(열림 시 초점 이동, 닫힘 시 복귀)
- `role="dialog"`, `aria-modal="true"` 및 접근 가능한 제목(`aria-labelledby` 등) 연결

---

### UC 매핑 (UC-UI-013~018)

| 유스케이스 | 검증 포인트 (요약) |
| --- | --- |
| UC-UI-013~018 | `08-test-usecases.md`에 정의된 수동 TimeEntry UI 시나리오와 1:1 대응 — 폼 검증, 겹침 모달, 목록 필터·빈 상태·편집/삭제 |

구현 완료 후 QA는 위 UC를 기준으로 컴포넌트·통합 테스트를 작성합니다.

---

## 완료 기준

- [ ] `ManualEntryForm`: `JobSelector` + `CategorySelector` + `TimeRangePicker` + 메모 통합
- [ ] `ManualEntryForm`: 입력값 검증 (필수 필드, 시간 범위)
- [ ] `ManualEntryForm`: overlap 감지 → `OverlapResolutionModal` 연동
- [ ] `ManualEntryForm`: 성공 시 토스트 + 폼 초기화
- [ ] `ManualEntryForm`: 로딩 상태 지원 (submit 버튼 비활성)
- [ ] `TimeEntryList`: `started_at` desc 정렬, Job/Category 이름 표시
- [ ] `TimeEntryList`: 기간 필터 (`DatePicker`), Job 필터 (`JobSelector`)
- [ ] `TimeEntryList`: 편집/삭제 액션, 빈 상태 UI
- [ ] `OverlapResolutionModal`: 시각적 타임라인 (색상 구분)
- [ ] `OverlapResolutionModal`: `new_first` / `existing_first` 전략 선택
- [ ] `OverlapResolutionModal`: 포커스 트랩, `role="dialog"`, `aria-modal="true"`

---

## 다음 단계

→ **3G: 테스트** (수동 TimeEntry UI 컴포넌트 테스트)
