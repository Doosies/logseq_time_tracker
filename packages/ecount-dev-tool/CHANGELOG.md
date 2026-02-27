# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Added

- Quick login active state persistence (chrome.storage.sync)
- Section drag-and-drop reordering on main screen
- Quick login button drag-and-drop reordering in edit mode

### Changed

- QuickLoginSection: 계정 편집 폼 버튼 순서 "수정 → 취소"에서 "취소 → 수정"으로 변경
- DnD library: `svelte-dnd-action` → `@dnd-kit/svelte` (via uikit)
- Quick login add-form position: above buttons → below buttons
- Drag handle UI: restored bar-style with grip dots
- CSS hardcoded values → theme token references (transition, z-index, shadow)
- Card hover effect: header color change → background color + border
- `type-check` script: added `svelte-check`

### Fixed

- QuickLoginSection: 편집 모드에서 팝업 닫힘 시 미저장 변경사항이 스토리지에 유지되던 버그 수정 (batch mode 도입)
- 섹션 설정 팝업이 App 영역 클릭 시 닫히지 않던 버그 수정 (`SectionSettings`)
- Drag handle hover scope (only bar, not entire card content)
- Drag feedback color (fallback values for theme scope issue)
- Button height shrink in edit mode

## [0.3.1] - 2026-02-27

### Fixed

- QuickLoginSection: section-active 클래스 제거로 로그인 후 섹션 헤더가 항상 파란색으로 표시되던 문제 수정
- DnD 시 빠른로그인 섹션 버벅거림 수정 (uikit Sortable getter 패턴 개선)

## [0.3.0] - 2026-02-26

### Added

- 섹션 숨기기/보이기 기능 추가
- 섹션 접기/펼치기 기능 추가
- 섹션 순서 변경 기능 추가

### Changed

- SectionSettings: clickOutside + 수동 상태 → Popover + CheckboxList Compound API
- QuickLoginSection: Section flat API → Section Compound API
- ServerManager: Section + ToggleInput flat API → Compound API, 이중 토글 방지
- ActionBar: Section flat API → Section Compound API
- StageManager: Section flat API → Section Compound API
- 섹션 순서 변경을 드래그앤드롭으로 교체
- 섹션 DnD UX 개선 (구분선 제거, 애니메이션 속도, 제목 드래그)
- 섹션 1개일 때 접기 비활성화 및 설정 버튼 UI 개선
- 팝업 레이아웃 개선 및 accounts 스토어 강화
- DndZone + snippet → Dnd.Zone + Dnd.Row compound API 마이그레이션
- 드래그 핸들 전용 DnD로 전환

### Fixed

- App.svelte: `<Card>` → `<Card.Root>` Compound Component 마이그레이션 누락 수정
- DnD ghost 요소에서 select 선택값 동기화
- chrome API mock 타입 에러 수정

### Refactored

- server UI store 및 컴포넌트 개선

### Tests

- App.svelte.test.ts: 접근성 검증(aria-label, role, keyboard) 및 에러 처리 테스트 추가
- StageManager.svelte.test.ts: 접근성 검증 및 에러 처리 테스트 추가

## [0.2.0] - 2026-02-09

### Changed

- (v2.2.0 → v2.3.0)
  - Vanilla JavaScript → Svelte 5 + TypeScript 완전 리팩토링
  - 컴포넌트 기반 아키텍처로 전환 (8개 컴포넌트)
  - 서비스 레이어 분리 (url_service, tab_service, page_actions)
  - Svelte Store 기반 상태 관리
  - @personal/uikit 통합
  - 타입 안정성 강화

## [0.1.0] - 2026-02-06

### Added

- (v2.2.0) - Chrome 확장프로그램
  - Quick Login 기능
  - EC Server Manager (V5/V3 서버 전환)
  - Local Server Buttons
  - Stage Server Manager
