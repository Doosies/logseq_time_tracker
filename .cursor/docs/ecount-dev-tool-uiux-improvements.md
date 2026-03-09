# ecount-dev-tool UI/UX 개선점 리스트

**작성일**: 2026-03-09  
**대상**: `packages/ecount-dev-tool/` Chrome Extension  
**분석 범위**: Svelte 컴포넌트, Storybook, 사용자 인터랙션, 접근성, 에러 처리

---

## Critical (사용성을 크게 저해하는 문제)

| ID | 이슈 | 컴포넌트 | 개선 제안 |
|----|------|----------|-----------|
| C1 | **에러 피드백이 `alert()`로만 표시됨** | ActionBar | `disableMin` 실패 시 `alert()` 사용. 팝업 닫힘 이후 확인 불가. Toast 또는 인라인 에러 영역으로 교체 권장 |
| C2 | **에러 발생 시 피드백 없음** | ActionBar | `5.0로컬`, `3.0로컬` 실패 시 사용자에게 알림 없음. ecount.com이 아닌 탭에서 클릭해도 반응 없음 |
| C3 | **비밀번호 평문 저장/표시** | QuickLoginSection, ScriptEditor | 계정 비밀번호가 편집 폼에 평문 표시. 보안 위험. 최소한 마스킹 또는 별도 "비밀번호 변경" 플로우 고려 |

---

## High (중요한 개선 사항)

| ID | 이슈 | 컴포넌트 | 개선 제안 |
|----|------|----------|-----------|
| H1 | **아이콘 버튼에 aria-label 없음** | ScriptList | 실행(▶), 수정(✏), 삭제(🗑) 버튼이 emoji만 사용. `aria-label="실행"` 등 추가 |
| H2 | **삭제 확인 없음** | ScriptList | `handleDelete` 호출 시 확인 없이 즉시 삭제. 실수 방지를 위해 확인 다이얼로그 추가 |
| H3 | **StageManager 제목 언어 불일치** | StageManager | "Stage Server Manager" (영어). 다른 섹션은 한글("서버 관리", "빠른 실행" 등)이므로 "Stage 서버 전환" 등으로 통일 |
| H4 | **로딩 중 UX** | App | "로딩 중..." 텍스트만 표시. 스피너 또는 스켈레톤으로 시각적 피드백 강화 |
| H5 | **서버 적용 실패 시 피드백 없음** | ServerManager | `updateTabUrl` 실패 시 사용자 알림 없음. Toast 또는 인라인 에러 표시 |
| H6 | **섹션 설정 라벨 불일치** | App vs SectionSettings | App: "빠른 실행", Storybook wrapper: "액션 바". 실제 라벨 통일 필요 |

---

## Medium (권장 개선 사항)

| ID | 이슈 | 컴포넌트 | 개선 제안 |
|----|------|----------|-----------|
| M1 | **Storybook 미보유 컴포넌트** | UserScriptSection, ScriptList, ScriptEditor, Calculator, StageManager | 시각적 회귀 방지를 위해 Storybook 스토리 추가 |
| M2 | **계정 삭제 시 확인 없음** | QuickLoginSection | `handleRemove` 즉시 삭제. 확인 다이얼로그 또는 undo 토스트 고려 |
| M3 | **DnD 드래그 핸들 가시성** | App | `.drag-handle-bar` 기본 `opacity: 0.3`. 시인성 개선 또는 툴팁 추가 |
| M4 | **Calculator 목적 불명확** | Calculator | "1+1 계산기"가 데모용인지 실제 기능인지 불명확. 제거 또는 실제 계산기 기능 구현 |
| M5 | **스크립트 실행 결과 피드백** | ScriptList | `run_status`가 ✓/✗로만 표시되고 2초 후 사라짐. 에러 시 상세 메시지 표시 권장 |
| M6 | **Section collapsible 일관성** | 전체 | Section.Header 클릭 시 접기/펼치기. README에는 "섹션 1개일 때 비활성화"라고 되어 있으나, UI에서 접힌/펼친 상태 시각적 표시(예: 화살표) 보강 |
| M7 | **팝업 크기 고정** | - | Chrome extension popup 기본 크기. 긴 스크립트 목록/편집 시 스크롤. max-height 최적화 또는 모달/탭 분리 검토 |

---

## Low (Nice-to-have)

| ID | 이슈 | 컴포넌트 | 개선 제안 |
|----|------|----------|-----------|
| L1 | **편집 모드 jiggle 애니메이션** | QuickLoginSection | `animation-delay`로 stagger 적용. 사용자 선호에 따라 온/오프 옵션 |
| L2 | **버튼 호버/포커스 스타일 통일** | QuickLoginSection | `.edit-toggle`, `.cancel-btn`, `.apply-btn` 등 커스텀 스타일. uikit Button과 시각적 일관성 검토 |
| L3 | **키보드 단축키** | ActionBar, QuickLoginSection | 자주 쓰는 액션에 키보드 단축키 제공 |
| L4 | **다크 모드** | 전체 | CSS 변수 기반이므로 다크 테마 추가 용이. 사용자 설정 연동 |
| L5 | **빈 상태 일관성** | ScriptList, QuickLoginSection | ScriptList: "등록된 스크립트가 없습니다.", QuickLogin: "편집 버튼을 눌러 계정을 추가하세요". 톤/레이아웃 통일 |

---

## 분석 시 발견된 사항 (참고)

### 접근성(a11y)

- **양호**: App 드래그 핸들 `aria-label`, SectionSettings `aria-label`, Popover trigger `aria-label`, CheckboxList item `aria-selected`
- **미흡**: ScriptList emoji 버튼, QuickLoginSection remove 버튼(`&times;`)에 aria-label 없음, ToggleInput/Select 포커스 링 등

### 에러 처리

- QuickLoginSection: `showError()` → 2.5초 후 자동 제거 (적절)
- ActionBar: `alert()` (부적절)
- ScriptEditor: 인라인 `error_message` (적절)
- ServerManager, StageManager: 에러 피드백 없음

### 시각적 일관성

- 대부분 `@personal/uikit` + CSS 변수 사용으로 일관적
- StageManager만 영어 제목으로 이질감

---

## 결정사항 (Decisions)

| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|
| planner가 분석 전담 | 코드 변경 없이 분석·리포트만 수행하므로 설계 전문 에이전트가 적합 | developer는 구현 담당, qa는 테스트 담당 |
| Critical에 보안 이슈 포함 | 비밀번호 평문 표시는 실제 사용 시 위험 | 별도 Security 에이전트 검토는 구현 단계에서 수행 |
| Calculator를 Medium으로 분류 | 데모용으로 보이나 제거 여부는 사용자 판단 | Critical(기능 없음)으로 분류 시 과도함 |

---

## 발견된 이슈 (Issues)

| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
| SectionSettings Storybook 섹션 라벨 "액션 바" vs App "빠른 실행" | Story Wrapper를 App과 동일한 sections prop 사용하도록 통일, 또는 문서화 | minor |
| StageManager가 SECTION_LIST에 없음 | Stage 페이지는 QuickLogin + StageManager만 표시되는 별도 플로우로 의도된 것으로 판단. 문서화 권장 | none |
| ScriptList toggle이 native checkbox | uikit ToggleInput 등으로 교체 시 일관성 향상 가능. 기존도 동작에는 문제 없음 | minor |

---

## 구현 가이드 (참고)

개선점 구현 시 다음 순서 권장:

1. **Critical** (C1~C3): 에러 피드백 개선, 보안 관련
2. **High** (H1~H6): a11y, 언어 일관성, 삭제 확인
3. **Medium** (M1~M7): Storybook, UX 피드백, Calculator 정리
4. **Low** (L1~L5): 선택적 적용

각 항목 구현 시 기존 `@personal/uikit` 컴포넌트 우선 활용.
