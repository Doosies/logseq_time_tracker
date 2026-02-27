# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added

- DnD primitives/components: `Provider`, `Sortable` (`@dnd-kit/svelte` 기반)
- Design tokens: `transition` (fast, normal, slow), `z_index` (base, above, popover), `shadow` (sm, md, lg)
- Dark theme shadow values with higher opacity for visibility

### Changed

- DnD library: `svelte-dnd-action` → `@dnd-kit/svelte` + `@dnd-kit/helpers`
- Styled components CSS: hardcoded values → theme token references (button, card, popover, toggle_input, checkbox_list, text_input, select)
- `type-check` script: added `svelte-check` for `.svelte` file type validation
- `exactOptionalPropertyTypes` compatibility fixes (Card, Section, CheckboxList)

### Removed

- DnD primitives/components: `Zone`, `Row`, `Handle` (svelte-dnd-action 기반)
- `DndEvent` type export

## [0.2.0] - 2026-02-26

### Added

- Popover Compound 컴포넌트 (Root/Trigger/Content) - clickOutside 자동 닫힘, Escape 키, aria-expanded
- Toast Compound 컴포넌트 (Provider/Root) - 자동 타이머 기반 알림
- CheckboxList Compound 컴포넌트 (Root/Item) - DnD 지원 체크박스 리스트
- Dnd.Handle styled 래퍼 - primitives/Dnd/Handle 기반 (bar/icon variant)
- CheckboxList.Item에 HTMLAttributes 확장 (rest props 지원)
- Section 접기/펼치기 기능 추가
- Section 컴포넌트에 action snippet 추가 (편집 버튼 제목 행 배치)
- svelte-dnd-action 의존성 및 barrel exports 추가

### Refactored

- Button, TextInput, Select, ButtonGroup을 primitives로 분리
- Section, Card, ToggleInput을 Compound Pattern으로 변환
- Dnd를 primitives로 이동, DndZone과 DragHandle을 통합
- Svelte 5 컴포넌트 props 타입 정리 및 `.svelte` 타입 선언 추가

### Fixed

- CheckboxList Root에서 `setContext` import 누락 버그 수정
- Dnd Handle에서 삭제된 DragHandle import를 primitives/Dnd/Handle로 교체
- Popover Trigger: rest props 전달 누락 수정 (aria-label 등 HTML 속성이 버튼에 전달되지 않던 문제)
- Popover/Root.svelte: exactOptionalPropertyTypes 타입 수정
- DnD 핸들 hover 스타일이 섹션 전체가 아닌 핸들 요소에 직접 hover할 때만 적용되도록 수정
- DnD 드래그 시 아이템 위치 변경 안 되는 버그 수정

### Changed

- 14개 스토리에 `parameters.docs.description`, `argTypes` 이벤트 설명, a11y 파라미터 추가
- 디자인 시스템 개선
- WCAG AA 기준 테마 색상 체계 재설계
- UI 디자인 종합 개선 및 리디자인

### Tests

- Popover 엣지케이스 스토리 3개 추가 (AriaExpanded, ContentHasLabel, MultipleToggle)
- Toast 엣지케이스 스토리 2개 추가 (MultipleToasts, ToastHasContent)
- CheckboxList 엣지케이스 스토리 3개 추가 (ToggleChecked, DisabledCannotToggle, ItemLabelsRendered)
- Dnd 스토리 신규 생성 3개 (Default, HasDragHandles, HandleHasAriaLabel)
- Section 엣지케이스 스토리 2개 추가 (WithAction, LongContentRendered)
- Card 엣지케이스 스토리 2개 추가 (HeaderAndFooterOnly, AllParts)
- ToggleInput 엣지케이스 스토리 2개 추가 (ToggleButton, PrefixRendered)
- 전체 58개 테스트 통과

## [0.1.0] - 2026-02-09

### Added

- Svelte 5 기반 공유 UI 컴포넌트 라이브러리
  - Button, ButtonGroup 컴포넌트
  - Card, Section 레이아웃 컴포넌트
  - TextInput, ToggleInput, Select 입력 컴포넌트
  - vanilla-extract 기반 디자인 시스템
  - Light/Dark 테마 지원
  - 디자인 토큰 시스템 (Contract)
