# 섹션 관리 기능 설계 문서

**작성일**: 2026-02-25  
**버전**: 3.2

---

## 1. 개요

섹션(빠른 로그인, 서버 관리, 빠른 실행)의 **표시 여부**와 **표시 순서**를 사용자가 설정할 수 있는 기능.

- **숨기기/보이기**: 섹션을 완전히 숨기거나 다시 표시
- **순서 변경**: 드래그앤드롭으로 섹션 표시 순서 조정 (설정 패널 + 메인 화면)

---

## 2. 아키텍처

### 2.1 데이터 흐름

```
chrome.storage.sync
  ├── section_visibility_state: Record<string, boolean>
  └── section_order_state: string[]
          │
    App.svelte
    ├── getSectionOrder() → 순서
    ├── isSectionVisible() → 필터
    └── visible_ordered_sections → 동적 렌더링
          │
    SectionSettings
    ├── 체크박스 → 숨기기/보이기
    └── 드래그앤드롭 → 순서 변경 (svelte-dnd-action)
          │
    App.svelte (메인 화면)
    └── 드래그 핸들 → 섹션 직접 드래그 순서 변경
```

### 2.2 Storage 키

| 키 | 타입 | 기본값 | 설명 |
|----|------|--------|------|
| `section_visibility_state` | `Record<string, boolean>` | `{}` | 섹션별 가시성 (없는 키는 `true` = 기본 보임) |
| `section_order_state` | `string[]` | `['quick-login', 'server-manager', 'action-bar']` | 섹션 표시 순서 |

### 2.3 안전장치

**가시성 (section_visibility)**:
- **최소 1개 섹션 보장**: 마지막 보이는 섹션은 숨길 수 없음
- **롤백**: storage 저장 실패 시 이전 상태로 복원
- **유효성 검증**: 저장 데이터가 올바르지 않으면 기본 상태 사용

**순서 (section_order)**:
- **누락된 ID 자동 추가**: 저장된 순서에 없는 섹션 ID는 끝에 추가
- **알 수 없는 ID 필터링**: 기본 순서에 없는 ID는 무시
- **저장 실패 시 롤백**: storage 저장 실패 시 이전 순서로 복원

---

## 3. 변경 파일 목록

### 신규 파일

| 파일 | 역할 |
|------|------|
| `stores/section_order.svelte.ts` | 섹션 순서 상태 관리 스토어 |
| `stores/__tests__/section_order.svelte.test.ts` | 순서 스토어 단위 테스트 (13개) |

### 삭제된 파일

| 파일 | 제거 이유 |
|------|-----------|
| `stores/section_collapse.svelte.ts` | 숨기기/보이기로 대체되어 접기 기능 불필요 |
| `stores/__tests__/section_collapse.svelte.test.ts` | 위 스토어 삭제에 따른 테스트 제거 |

### 수정 파일

| 파일 | 변경 내용 |
|------|-----------|
| `stores/index.ts` | `section_order.svelte` export 추가, `section_collapse` export 제거 |
| `components/App/App.svelte` | `getSectionOrder()` + `isSectionVisible()` 기반 동적 렌더링, 구분선 로직 단순화 |
| `components/App/__tests__/App.svelte.test.ts` | 섹션 순서 관련 통합 테스트 3개 추가 |
| `components/SectionSettings/SectionSettings.svelte` | 패널 제목 "섹션 설정", ▲/▼ 이동 버튼 추가, 순서 기반 목록 표시 |
| `components/QuickLoginSection/QuickLoginSection.svelte` | `collapsible`, `collapsed`, `onToggle` props 제거 |
| `components/ServerManager/ServerManager.svelte` | `collapsible`, `collapsed`, `onToggle` props 제거 |
| `components/ActionBar/ActionBar.svelte` | `collapsible`, `collapsed`, `onToggle` props 제거 |
| `packages/uikit/Section/Section.svelte` | `collapsible`, `collapsed`, `onToggle` props 제거 |
| `packages/uikit/design/styles/section.css.ts` | `section_title_collapsible`, `section_chevron`, `section_chevron_collapsed`, `section_content_collapsed` 스타일 제거 |

### 제거된 Storage 키

- `section_collapse_state` (chrome.storage.sync에서 더 이상 사용하지 않음)

---

## 4. API 명세

### section_visibility.svelte.ts

```typescript
initializeVisibility(): Promise<void>
// chrome.storage.sync에서 상태 복원

isSectionVisible(section_id: string): boolean
// 섹션 가시성 반환 (기본: true)

toggleVisibility(
    section_id: string,
    visible_ids: string[]
): Promise<boolean>
// 가시성 토글. 마지막 섹션이면 false 반환
```

### section_order.svelte.ts

```typescript
DEFAULT_ORDER: readonly ['quick-login', 'server-manager', 'action-bar']

getSectionOrder(): string[]
// 현재 섹션 순서 반환

initializeSectionOrder(): Promise<void>
// chrome.storage.sync에서 순서 복원

setSectionOrder(new_order: string[]): Promise<boolean>
// 전체 순서를 한번에 설정 (DnD용)

moveSectionUp(section_id: string): Promise<boolean>
// 섹션을 위로 이동. 첫 번째 항목이면 false (키보드 접근성 폴백)

moveSectionDown(section_id: string): Promise<boolean>
// 섹션을 아래로 이동. 마지막 항목이면 false (키보드 접근성 폴백)
```

### SectionSettings.svelte Props

```typescript
interface SectionItem {
    id: string;
    label: string;
}

interface SectionSettingsProps {
    sections: SectionItem[];
}
```

### SectionSettings.svelte UI

- **패널 제목**: "섹션 설정"
- **체크박스**: 각 섹션의 숨기기/보이기 토글
- **드래그앤드롭**: 항목을 드래그하여 순서 변경 (`svelte-dnd-action`)
- **키보드 접근성**: ArrowUp/Down으로 순서 변경 (`moveSectionUp`/`moveSectionDown` 폴백)
- **드래그 핸들**: 6-dot grip 아이콘 (각 항목 좌측)
- **목록 순서**: `getSectionOrder()` 기반으로 표시

### App.svelte 메인 화면 DnD

- **드래그 핸들**: full-width 바 형태 (`──── ⠿ ────`), 항상 보이며 hover 시 강조. 섹션 제목 클릭으로도 드래그 시작 가능
- **dragDisabled 패턴**: 핸들 pointerdown 시만 드래그 활성화 (섹션 내부 상호작용 보호)
- **드래그 스타일링**: `transformDraggedElement`로 그림자/리프트 효과, `dropTargetStyle`로 기본 노란 outline 제거
- **Stage 모드**: DnD 비활성화 (QuickLogin만 표시되므로 의미 없음)
- **숨겨진 섹션 처리**: 드롭 완료 시 보이는 섹션 순서 + 숨겨진 섹션 순서 병합

---

## 5. App.svelte 렌더링 로직

### 동적 렌더링

```typescript
// 순서 + 가시성 기반 필터링
const visible_ordered_sections = $derived(
    section_order.filter((id) => isSectionVisible(id)),
);

// Stage 탭에서는 quick-login만, 일반 탭에서는 전체
const sections_to_render = $derived(
    tab.is_stage
        ? visible_ordered_sections.filter((id) => id === 'quick-login')
        : visible_ordered_sections,
);
```

### 구분선(divider) 로직

- DnD 호환을 위해 CSS border 기반으로 변경 (기존 `<hr>` 제거)
- `.section-wrapper + .section-wrapper`에 `border-top` 적용
- Stage 모드에서는 `.section-divider` div 사용

---

## 6. 테스트 현황

- **전체 테스트**: 159개 통과
- **section_order 단위 테스트**: 16개
  - 초기화: 7개 (기본값, 유효 데이터, 잘못된 데이터, storage 오류, 누락 ID 추가, 알 수 없는 ID 필터, 초기화 전 setSectionOrder 불가)
  - 순서 변경: 9개 (위로/아래로 이동, 경계 조건, 저장 실패 롤백, setSectionOrder 전체 순서 변경/저장/롤백)
- **App.svelte 통합 테스트**: 섹션 순서 관련 4개 (기본 순서, 저장된 순서, 설정 패널 DnD 핸들, 메인 화면 DnD 핸들)

---

## 7. 변경 이력

### v3.2 (2026-02-25)

- **중복 구분선 제거**: 드래그 바가 섹션 구분 역할을 하므로 `border-top` 제거
- **DnD 애니메이션 속도 개선**: `flipDurationMs` 200 → 80으로 단축 (설정 패널도 동일)
- **섹션 제목 드래그 지원**: 제목 영역(`[data-drag-handle]`)을 클릭해도 드래그 시작
  - Section 컴포넌트의 title div에 `data-drag-handle` 속성 추가
  - App.svelte에서 이벤트 위임으로 `[data-drag-handle]` pointerdown 감지
  - `cursor: grab` 스타일로 드래그 가능 영역 시각적 피드백

### v3.1 (2026-02-25)

- **드래그 핸들 UX 개선**: 보이지 않는 작은 버튼 → 항상 보이는 full-width 바 (`──── ⠿ ────`)
  - `::before`/`::after` 의사 요소로 양쪽 선 + 중앙 grip dots
  - 기본 `opacity: 0.3`, hover 시 `opacity: 0.7` + primary 색상 전환
- **드래그 중 UI 개선**: `transformDraggedElement`로 그림자/리프트 효과 적용
  - `dropTargetStyle: { outline: 'none' }`으로 기본 노란 outline 제거
  - 설정 패널에도 동일한 드래그 스타일 적용
- **계정 코드 가독성 개선**: `.account-code`의 `opacity: 0.8` 제거
  - `font-size: xs` + `letter-spacing: 0.03em`으로 시각적 구분 유지
- **테스트**: 159개 통과 (변경 없음)

### v3.0 (2026-02-25)

- **드래그앤드롭 순서 변경 도입**: ▲/▼ 버튼을 svelte-dnd-action 기반 DnD로 교체
  - 의존성 추가: `svelte-dnd-action` (~8KB, 0 외부 의존성)
  - Store: `setSectionOrder()` 함수 추가 (DnD finalize 시 전체 순서 일괄 설정)
  - SectionSettings: 드래그 핸들(grip dots) + DnD zone으로 항목 순서 변경
  - App.svelte: 메인 화면 섹션 직접 DnD (dragDisabled 패턴 + 드래그 핸들)
  - Divider: `<hr>` → CSS border 기반 (DnD 호환)
- **접근성**: 설정 패널에서 ArrowUp/Down 키보드 폴백 유지, aria 속성 추가
- **테스트**: 159개 통과 (setSectionOrder 3개 + DnD DOM 구조 1개 추가)

### v2.0 (2026-02-25)

- **접기(Collapse) 토글 기능 제거**: 숨기기/보이기로 대체되어 불필요
  - 삭제: `section_collapse.svelte.ts`, `section_collapse.svelte.test.ts`
  - 제거: Section 컴포넌트의 `collapsible`, `collapsed`, `onToggle` props 및 관련 스타일
  - 제거: Storage 키 `section_collapse_state`
- **섹션 순서 변경 기능 추가**
  - 신규: `section_order.svelte.ts` 스토어
  - SectionSettings에 ▲/▼ 이동 버튼 추가
  - App.svelte 동적 렌더링 (`getSectionOrder()` + `isSectionVisible()`)
  - 구분선 로직 단순화

### v1.1 (2026-02-25)

- UI 정리, 섹션 접기 토글 비활성화 (v2.0에서 접기 기능 전체 제거)

### v1.0 (2026-02-25)

- 초기 설계: 섹션 숨기기/보이기 기능
