# ecount-dev-tool UI/UX 분석 및 개선점 도출 실행 계획

**작성일**: 2026-03-09  
**대상 패키지**: `packages/ecount-dev-tool/`  
**목표**: Chrome Extension UI/UX 분석 후 우선순위별 개선점 리스트업

---

## 1. 현재 상태 요약

### 1.1 컴포넌트 구조

| 컴포넌트 | 경로 | 주요 역할 |
|----------|------|-----------|
| App | `App/App.svelte` | 루트 레이아웃, 섹션 DnD, 탭 상태 분기 |
| QuickLoginSection | `QuickLoginSection/` | 계정 목록, DnD 순서 변경, 로그인 |
| ServerManager | `ServerManager/` | V5/V3 서버 Select/Text 전환, URL 적용 |
| StageManager | `StageManager/` | Stage 서버 전환 버튼 |
| ActionBar | `ActionBar/` | 5.0로컬, 3.0로컬, disableMin 버튼 |
| SectionSettings | `SectionSettings/` | 섹션 표시/숨기기, 순서 DnD (Popover) |
| Calculator | `Calculator/` | 1+1 계산 (데모용) |
| UserScriptSection | `UserScriptSection/` | 스크립트 목록/편집기 뷰 전환 |
| ScriptList | `UserScriptSection/ScriptList.svelte` | 스크립트 목록, 실행/수정/삭제 |
| ScriptEditor | `UserScriptSection/ScriptEditor.svelte` | 스크립트 추가/수정 폼 |

### 1.2 Storybook 커버리지

| 컴포넌트 | 스토리 존재 | 비고 |
|----------|:-----------:|------|
| QuickLoginSection | ✅ | WithAccounts, EmptyAccounts |
| ServerManager | ✅ | ZeusEnvironment, TestEnvironment, UnsupportedEnvironment |
| ActionBar | ✅ | Default |
| SectionSettings | ✅ | Default, WithHiddenSection |
| StageManager | ❌ | - |
| Calculator | ❌ | - |
| UserScriptSection | ❌ | - |
| ScriptList | ❌ | - |
| ScriptEditor | ❌ | - |

### 1.3 기술 스택

- Svelte 5 (Runes), TypeScript
- @personal/uikit (Section, Card, Dnd, Button, TextInput, Select, Popover, CheckboxList 등)
- vanilla-extract (CSS 변수 기반)

---

## 2. 실행 계획

### Phase 1: 컴포넌트별 분석 (병렬 가능 그룹 분리)

#### 2.1 그룹 A (독립 분석) — **병렬 실행 가능**

| 순번 | 컴포넌트 | 담당 에이전트 | 작업 내용 |
|:----:|----------|---------------|-----------|
| A1 | QuickLoginSection | **planner** | Svelte/Storybook 읽기, UI 구조·인터랙션·a11y·에러 처리 분석 |
| A2 | ServerManager | **planner** | 동일 |
| A3 | ActionBar | **planner** | 동일 |
| A4 | SectionSettings | **planner** | 동일 |
| A5 | StageManager | **planner** | 동일 |
| A6 | Calculator | **planner** | 동일 |

#### 2.2 그룹 B (연관 컴포넌트) — **순차 또는 소규모 병렬**

| 순번 | 컴포넌트 | 담당 에이전트 | 작업 내용 |
|:----:|----------|---------------|-----------|
| B1 | App | **planner** | 전체 레이아웃, DnD 플로우, 로딩/Stage 분기, SectionSettings 연동 |
| B2 | UserScriptSection | **planner** | list/editor 전환, ScriptList·ScriptEditor 연동 분석 |
| B3 | ScriptList | **planner** | 스크립트 아이템 UI, 토글, 버튼(a11y 포함) |
| B4 | ScriptEditor | **planner** | 폼 레이아웃, 유효성, run_at 옵션, 에러 표시 |

**실행 방식**: B1 → B2, B3, B4 (B2~B4는 B1 이후 병렬 가능)

#### 2.3 Phase 1 체크리스트 (컴포넌트별)

각 컴포넌트 분석 시 다음 항목 검토:

- [ ] **UI 구조**: 마크업, 레이아웃, 시각적 계층
- [ ] **사용자 인터랙션 플로우**: 클릭/키보드/드래그 시나리오
- [ ] **접근성(a11y)**: aria-label, role, tabindex, 포커스 순서, 스크린 리더
- [ ] **에러 처리 및 피드백**: 메시지 표시, 로딩/비활성화 상태
- [ ] **시각적 일관성**: @personal/uikit 사용, CSS 변수 일관성
- [ ] **반응형/팝업 크기**: Chrome popup 고정 크기 대응

---

### Phase 2: 개선점 리스트업 및 우선순위 분류

| 순번 | 작업 | 담당 에이전트 | 입력 | 출력 |
|:----:|------|---------------|------|------|
| P1 | Phase 1 분석 결과 취합 | **planner** | Phase 1 산출물 | 통합 이슈 목록 |
| P2 | 개선점 카테고리 분류 | **planner** | 통합 이슈 목록 | 사용성/시각/a11y/성능/반응형/에러 처리 |
| P3 | 우선순위 분류 | **planner** | 분류된 이슈 | Critical / High / Medium / Low |
| P4 | 최종 리포트 작성 | **planner** | 우선순위 분류 | Markdown 리포트 |

**실행 방식**: P1 → P2 → P3 → P4 (순차)

---

### Phase 3: 최종 리포트 작성

| 순번 | 작업 | 담당 에이전트 | 출력물 |
|:----:|------|---------------|--------|
| F1 | 우선순위별 개선점 리스트 Markdown 생성 | **planner** | `ecount-dev-tool-uiux-improvements.md` |
| F2 | 결정사항·이슈 테이블 포함 | **planner** | 동일 문서 내 |

---

## 3. 우선순위 분류 기준

| 등급 | 정의 | 예시 |
|------|------|------|
| **Critical** | 사용성을 크게 저해하는 문제 | 버튼 클릭 무반응, 주요 기능 접근 불가 |
| **High** | 중요한 개선 사항 | 에러 메시지 부재, a11y 미흡, 일관성 깨짐 |
| **Medium** | 권장 개선 사항 | 피드백 개선, 시각적 정돈 |
| **Low** | Nice-to-have | 애니메이션, 마이크로 인터랙션 |

---

## 4. 담당 에이전트 역할 정리

- **planner**: 요구사항 분석 및 시스템 설계 전문. 본 작업은 코드 변경 없이 분석·리포트만 수행하므로 planner가 전체를 담당.
- **generalPurpose**: 본 계획에서는 사용하지 않음. 구현 단계에서 필요 시 developer 등 다른 에이전트 활용.
- **developer / qa / docs**: 본 분석 작업 범위에 포함되지 않음. 개선점 구현 시 별도 워크플로우로 호출.

---

## 5. 직렬/병렬 실행 요약

```
Phase 1: 컴포넌트별 분석
├── 그룹 A (A1~A6): 병렬 실행 가능
│   └── QuickLoginSection, ServerManager, ActionBar, SectionSettings, StageManager, Calculator
└── 그룹 B: B1 완료 후 B2~B4 병렬
    ├── B1: App
    └── B2, B3, B4: UserScriptSection, ScriptList, ScriptEditor

Phase 2: 개선점 리스트업
└── P1 → P2 → P3 → P4 (순차)

Phase 3: 최종 리포트
└── F1, F2 (순차)
```

---

## 6. 예상 산출물 구조

### 6.1 최종 리포트 (`ecount-dev-tool-uiux-improvements.md`)

```markdown
# ecount-dev-tool UI/UX 개선점 리스트

## Critical
| ID | 이슈 | 컴포넌트 | 개선 제안 |
|----|------|----------|-----------|

## High
...

## Medium
...

## Low
...

## 결정사항 (Decisions)
| 결정 | 근거 | 검토한 대안 |
|------|------|-------------|

## 발견된 이슈 (Issues)
| 이슈 | 해결 방법 | 영향도 |
|------|-----------|--------|
```

---

## 7. 참고 사항

- 이 작업은 **코드 변경 없이** 분석 및 리포트 작성만 수행합니다.
- 구현은 별도 태스크로 분리하며, 본 계획의 출력물을 입력으로 활용합니다.
- `.cursor/skills/planner/SKILL.md` 및 `references/requirement-analysis.md` 참조.
