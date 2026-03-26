# Phase 3D: 고급 셀렉터 & 데이트피커

## 목표

`CategorySelector`, `JobSelector`, `DatePicker`, `TimeRangePicker` 고급 UI 컴포넌트를 구현합니다. 트리·검색·상태 필터·캘린더·시간 범위를 일관된 드롭다운/오버레이 패턴과 키보드 접근성으로 제공합니다.

---

## 선행 조건

- Phase 2 완료 — Category 트리 구조, Job CRUD 동작

---

## 참조 설계 문서

| 문서 | 섹션 | 참조 |
| --- | --- | --- |
| `06-ui-ux.md` | §셀렉터 설계 | CategorySelector, JobSelector 커스텀 select |
| `06-ui-ux.md` | §데이트피커 | DatePicker + TimeRangePicker |
| `06-ui-ux.md` | §키보드 접근성 | Tab, Arrow, Enter, Escape 동작 |
| `03-data-model.md` | §Category | 트리 구조 (`parent_id`), `is_active` |
| `03-data-model.md` | §Job | 상태 (`StatusKind`) 정의 |
| `08-test-usecases.md` | UC-UI-009~012 | 셀렉터/데이트피커 테스트 유스케이스 |

---

## 생성/변경 파일 목록

`packages/time-tracker-core/src` 기준.

| 파일 | 역할 | 변경 유형 |
| --- | --- | --- |
| `components/CategorySelector/CategorySelector.svelte` | 트리 구조 카테고리 선택 | 신규 |
| `components/CategorySelector/category_selector.css.ts` | 스타일 | 신규 |
| `components/JobSelector/JobSelector.svelte` | Job 선택 (검색 + 상태 필터) | 신규 |
| `components/JobSelector/job_selector.css.ts` | 스타일 | 신규 |
| `components/DatePicker/DatePicker.svelte` | 캘린더 날짜 선택 | 신규 |
| `components/DatePicker/date_picker.css.ts` | 스타일 | 신규 |
| `components/TimeRangePicker/TimeRangePicker.svelte` | 시간 범위 선택 | 신규 |
| `components/TimeRangePicker/time_range_picker.css.ts` | 스타일 | 신규 |
| `components/index.ts` | barrel export 추가 | 변경 |

---

## 상세 구현 내용

### 1. CategorySelector.svelte (`06-ui-ux.md` §셀렉터 설계)

**Props (TypeScript)**

```typescript
type CategorySelectorProps = {
  categories: Category[];
  selected_id: string | null;
  onSelect: (id: string) => void;
  placeholder?: string;
};
```

**기능**

- 트리 구조 탐색: 브레드크럼(`root > parent > current`) + 현재 노드의 하위 항목 목록
- 검색: `name` 기반 필터링 — 검색 활성 시 전체 트리를 flat 리스트로 펼쳐 매칭 항목만 표시(또는 매칭 서브트리 하이라이트; UX는 `06-ui-ux.md`와 동일하게 유지)
- 드롭다운 UI: 트리거 클릭 시 패널 열림/닫힘, 외부 클릭 시 닫힘
- 키보드: Tab(포커스 진입), Arrow Up/Down(하이라이트 이동), Enter(선택 확정), Escape(패널 닫기)
- `is_active === false`인 카테고리는 목록·검색 결과에서 제외

**동작**

- `categories`는 평면 배열(`parent_id`로 부모 연결)이라고 가정하고, `$derived`로 현재 `selected_id` 기준 경로(브레드크럼)와 자식 목록을 계산합니다.
- 검색어가 비어 있으면 트리 탐색 모드, 비어 있지 않으면 flat 필터 모드로 전환합니다.

**Svelte 5 (Runes) 스케치**

```svelte
<script lang="ts">
  let { categories, selected_id, onSelect, placeholder }: CategorySelectorProps = $props();

  let is_open = $state(false);
  let search_query = $state('');
  let active_index = $state(0);

  const visible_categories = $derived(
    filterActiveCategories(categories).filter((c) =>
      search_query.trim() ? matchesSearch(c, search_query) : true,
    ),
  );

  $effect(() => {
    if (!is_open) {
      search_query = '';
      active_index = 0;
    }
  });
</script>
```

---

### 2. JobSelector.svelte

**Props (TypeScript)**

```typescript
type JobSelectorProps = {
  jobs: Job[];
  selected_id: string | null;
  onSelect: (id: string) => void;
  status_filter?: StatusKind[];
};
```

**기능**

- `title` 기반 검색(부분 일치, 대소문자 정책은 디자인 문서와 일치)
- `status_filter`가 있으면 해당 상태만 후보에 포함; 각 행에 상태 뱃지(`pending`, `in_progress`, `paused` 등) 표시
- 드롭다운 UI: CategorySelector와 동일한 인터랙션 패턴(열림/닫힘, 포커스 트랩은 필요 시 최소 범위로)
- 키보드 접근성: Tab, Arrow Up/Down, Enter, Escape

**동작**

- `$derived`로 `status_filter` 적용 후 검색어로 `filtered_jobs` 계산
- 선택된 Job의 `title`을 트리거에 표시, `selected_id === null`이면 placeholder

---

### 3. DatePicker.svelte (`06-ui-ux.md` §데이트피커)

**Props (TypeScript)**

```typescript
type DatePickerProps = {
  value: string | null; // YYYY-MM-DD 또는 null
  onSelect: (date: string) => void;
  min?: string;
  max?: string;
};
```

**기능**

- 캘린더 그리드: 월 단위 뷰, 주 단위 행 정렬
- 이전/다음 월 네비게이션 버튼
- `min`/`max`(포함 경계) 밖 날짜는 버튼 비활성 및 클릭 불가
- `onSelect`로 **`YYYY-MM-DD`** 문자열만 전달(로컬 달력 날짜 기준; 타임존은 문서화된 규칙에 따름)

**동작**

- `$state`로 `viewing_year`, `viewing_month` 관리
- 그리드 셀은 `aria-selected`, `aria-disabled` 등 캘린더 역할에 맞게 설정
- Arrow 키로 셀 이동 시 `aria-activedescendant`와 조합 가능하면 적용

---

### 4. TimeRangePicker.svelte

**Props (TypeScript)**

```typescript
type TimeRangePickerProps = {
  started_at: string;
  ended_at: string;
  onChange: (start: string, end: string) => void;
};
```

**기능**

- `DatePicker` + 시작/종료 각각 **시간 입력(`HH:mm`)** 조합
- 사용자가 값을 바꿀 때마다 **시작 ≤ 종료** 실시간 검증; 위반 시 시각적 오류 표시 및 `onChange` 호출 정책은 `06-ui-ux.md`에 맞춤(예: 호출하지 않거나 동일하게 유지)
- 부모로 넘기는 문자열은 **UTC ISO8601**(예: `toISOString()` 결과와 동일한 형식) — 로컬 날짜·시간을 앱 규칙에 따라 UTC로 변환한 뒤 전달

**동작**

- 내부적으로 로컬 편집 상태를 `$state`로 두고, 유효할 때만 파싱해 ISO 문자열로 `$derived` 또는 커밋 시점에 변환
- `DatePicker`는 동일 파일 내 서브 블록 또는 임포트 컴포넌트로 재사용

---

### 공통: 키보드·접근성 (a11y)

- 리스트형 셀렉터: `role="listbox"`, 옵션에 `role="option"`, 트리거에 `aria-expanded`, `aria-controls`
- 키보드 포커스와 시각적 하이라이트가 어긋나지 않도록 `aria-activedescendant` 또는 네이티브 포커스 이동 중 하나를 일관되게 선택
- `06-ui-ux.md` §키보드 접근성과 `08-test-usecases.md` UC-UI-009~012를 구현·테스트 기준으로 삼음

---

## UC 매핑: UC-UI-009~012

| 유스케이스 | 컴포넌트 / 범위 |
| --- | --- |
| UC-UI-009 | CategorySelector — 트리 탐색, 브레드크럼, 검색, 비활성 카테고리 제외 |
| UC-UI-010 | JobSelector — 제목 검색, 상태 필터·뱃지, 선택 확정 |
| UC-UI-011 | DatePicker — 월 이동, min/max, YYYY-MM-DD 출력 |
| UC-UI-012 | TimeRangePicker — 날짜+시간 편집, 시작≤종료, UTC ISO8601 출력 |

(세부 시나리오 문구는 `08-test-usecases.md` 원문을 따름.)

---

## 완료 기준

- [ ] CategorySelector: 트리 구조 탐색, 브레드크럼, 검색 필터링
- [ ] CategorySelector: 드롭다운 UI, `is_active=false` 숨김
- [ ] JobSelector: title 검색, 상태 필터 뱃지, 드롭다운 UI
- [ ] DatePicker: 캘린더 그리드, 월 네비게이션, min/max 제약
- [ ] TimeRangePicker: DatePicker + 시간 입력 조합, 시작≤종료 검증
- [ ] 모든 컴포넌트 키보드 접근성 (Tab, Arrow, Enter, Escape)
- [ ] a11y: `aria-expanded`, `aria-activedescendant`, `role="listbox"`
- [ ] 출력 형식: DatePicker는 `YYYY-MM-DD`, TimeRangePicker는 UTC ISO8601

---

## 다음 단계

→ **3E: 수동 TimeEntry UI** (`ManualEntryForm`에서 셀렉터/데이트피커 활용)
