# 작업 보고서: time-tracker-core 컴포넌트 일반화 → uikit 이동

**cycle_id**: 2026-03-26-001
**task_type**: refactor
**commit**: `55e5216` — `refactor(uikit, time-tracker-core): 일반화 가능한 컴포넌트 6개를 uikit으로 이동`

---

## 변경 사항

### uikit 신규 파일 (~40개)

| 컴포넌트 | primitives | components | design/styles |
|----------|-----------|------------|---------------|
| LayoutSwitcher | LayoutSwitcher.svelte, index.ts | (불필요) | — |
| DatePicker | DatePicker.svelte, types.ts, index.ts | DatePicker.svelte, index.ts, tests | date_picker.css.ts |
| TimeRangePicker | TimeRangePicker.svelte, types.ts, index.ts | TimeRangePicker.svelte, index.ts, tests | time_range_picker.css.ts |
| PromptDialog | PromptDialog.svelte, index.ts | PromptDialog.svelte, index.ts, tests | prompt_dialog.css.ts |
| ElapsedTimer | ElapsedTimer.svelte, index.ts | ElapsedTimer.svelte, index.ts, tests | elapsed_timer.css.ts |
| Toast (확장) | Provider.svelte 수정, Root.svelte 수정 | Root.svelte 수정 | toast.css.ts 수정 |

### time-tracker-core 변경

- **삭제**: DatePicker/, LayoutSwitcher/, TimeRangePicker/ 디렉토리, TimerDisplay.svelte, reason_modal.css.ts
- **수정→wrapper**: ReasonModal.svelte (PromptDialog thin wrapper)
- **import 변경**: Timer.svelte, Toolbar.svelte, InlineView.svelte, ManualEntryForm.svelte, TimeEntryList.svelte, date_field.svelte, datetime_field.svelte
- **의존성 추가**: `@personal/uikit: workspace:*`

### 타입/export 추가

- `design/types/index.ts`: `LayoutMode`, `ToastLevel`
- `components/index.ts`: 5개 컴포넌트 export
- `uikit/src/index.ts`: 타입 re-export

---

## 품질 지표

| 패키지 | format | test | lint | type-check | build | e2e |
|--------|--------|------|------|------------|-------|-----|
| @personal/uikit | ✅ | ✅ (117) | ✅ | ✅ | ✅ | — |
| @personal/time-tracker-core | ✅ | ✅ (342) | ✅ | ✅ | ✅ | — |
| @personal/logseq-time-tracker | ✅ | ✅ (3) | ✅ | ✅ | ✅ | ✅ (13) |

**총 테스트**: 475개 (Vitest 462 + E2E 13)

---

## 보안 검증

- Critical/High 취약점: 0
- 민감정보 노출: 0
- Prototype 오염: 0
- 조건부 권고: DatePicker `locale` prop에 비신뢰 입력 직접 연결 금지 (Low)

---

## 주요 결정사항

| 결정 | 근거 |
|------|------|
| primitives에 `classes` object prop 패턴 채택 | 다수 스타일 슬롯이 필요한 복합 컴포넌트 (DatePicker, TimeRangePicker)에 적합 |
| LayoutSwitcher는 components 계층 불필요 | 순수 동작 컴포넌트, 시각적 variant 없음 |
| DatePicker locale prop 추가 | 요일 라벨 하드코딩 제거, Intl.DateTimeFormat 활용 |
| TimerDisplay → ElapsedTimer 이름 변경 | 도메인 중립적 이름 |
| Toast에 data-level 속성 + globalStyle | vanilla-extract의 data-attribute 셀렉터로 level별 스타일 적용 |
| ReasonModal thin wrapper 유지 | 기존 소비자 코드 변경 최소화, 도메인 기본값 주입 |
| test setup에 ResizeObserver mock 추가 | @dnd-kit 의존으로 jsdom에서 필요 |

---

## 발견된 이슈

| 이슈 | 해결 | 영향 |
|------|------|------|
| DatePicker.svelte 소스 파일이 빈 상태 | git HEAD에서 복원 | minor |
| @dnd-kit이 jsdom에서 ResizeObserver 요구 | test/setup.ts에 no-op mock | minor (테스트 전용) |
| exactOptionalPropertyTypes로 undefined 전달 불가 | spread 패턴으로 우회 | minor |
| IDE ReadLints가 workspace 모듈 미해결 표시 | tsc/svelte-check 통과로 확인, IDE 서버 한계 | none |

---

**66 files changed, 1266 insertions(+), 342 deletions(-)**
