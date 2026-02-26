# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [0.2.0] - 2026-02-26

### Added

- Popover Compound 컴포넌트 (Root/Trigger/Content) - clickOutside 자동 닫힘, Escape 키, aria-expanded
- Toast Compound 컴포넌트 (Provider/Root) - 자동 타이머 기반 알림
- CheckboxList Compound 컴포넌트 (Root/Item) - DnD 지원 체크박스 리스트
- Dnd.Handle styled 래퍼 - primitives/Dnd/Handle 기반 (bar/icon variant)
- CheckboxList.Item에 HTMLAttributes 확장 (rest props 지원)

### Fixed

- CheckboxList Root에서 `setContext` import 누락 버그 수정
- Dnd Handle에서 삭제된 DragHandle import를 primitives/Dnd/Handle로 교체

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
