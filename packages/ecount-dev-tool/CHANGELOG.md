# Changelog

이 패키지의 모든 주요 변경사항을 기록합니다.

형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.0.0/)를 따르며,
버전 관리는 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

### Changed

- ScriptList 수정/삭제 버튼 아이콘 개선
  - 수정 버튼: `✏` 이모지 → Heroicons solid pencil SVG (fill="currentColor")
  - 삭제 버튼: `🗑` 이모지 → Heroicons trash SVG (stroke="currentColor")
  - 플랫폼별 렌더링 일관성 향상, 기존 aria-label 유지
- 사용자 스크립트 실행 시점을 `document_idle` (페이지 로드 후)로 고정
  - UI에서 실행 시점 선택 필드 제거
  - 모든 신규 및 기존 스크립트가 `document_idle`로 실행됨
  - 이유: 대부분의 사용 사례에서 `document_idle`이 적합하며, UI 단순화로 사용성 개선

### Technical

- `ScriptEditor.svelte`: 실행 시점 Select UI 주석 처리 (복원 가이드 포함)
- `user_scripts.svelte.ts`: 마이그레이션 로직에서 모든 스크립트를 `document_idle`로 변환
- `background.test.ts`: `document_start` 관련 테스트 주석 처리
- 복원 방법: 소스 코드의 `[FEATURE_TOGGLE]` 주석 참조

### Migration

- 기존 `document_start` 스크립트는 자동으로 `document_idle`로 변경됨
- 동작 차이: 페이지 로드 전 → 페이지 로드 후 실행으로 변경

### Added

- 스크립트 편집을 위한 별도 페이지(editor.html) 추가
- URL hash 기반 라우팅 구현 (`#new`, `#script-id`)
- 2단 레이아웃 편집 화면 (메타데이터 360px | 코드 에디터 가변)
- 키보드 단축키 지원 (Ctrl+S 저장, Esc 취소)
- 반응형 레이아웃 (< 900px: 1단 레이아웃)
- 사용자 스크립트 실행기 (User Script Runner) 기능 추가
  - 사용자 작성 JavaScript를 ecount.com 페이지에서 실행
  - 자동 실행: URL 패턴 매칭(`@include` glob) 시 페이지 로드 완료 후 자동 주입
  - 수동 실행: 팝업에서 버튼 클릭으로 현재 탭에 즉시 실행
  - MAIN world 실행 (페이지 전역 변수 접근 가능)
  - Background Service Worker로 `chrome.tabs.onUpdated` 감지 및 자동 주입
  - `chrome.storage.local` 기반 스크립트 CRUD (100KB 이상 지원)
  - ScriptList: 토글 활성/비활성, 실행, 편집, 삭제 UI
  - ScriptEditor: 이름/URL패턴/코드 입력 폼
  - UserScriptSection: 리스트 ↔ 편집 뷰 전환
- Quick login active state persistence (chrome.storage.sync)
- Section drag-and-drop reordering on main screen
- Quick login button drag-and-drop reordering in edit mode

### Changed

- 스크립트 추가/수정 시 새 탭에서 `editor.html` 열림
- `UserScriptSection`에서 view_mode 전환 방식 제거
- 섹션 레지스트리 패턴 도입으로 확장성 개선
  - `sections/` 디렉터리: `registry.ts`에서 중앙 집중식 섹션 정의
  - 새 섹션 추가 시 registry.ts 한 곳만 수정
  - App.svelte: 동적 컴포넌트 렌더링으로 단순화
  - section_order: SECTION_REGISTRY 기반 DEFAULT_ORDER
- UserScriptSection: 헤더 취소 버튼 제거, 폼 내 취소 버튼만 유지 (취소 버튼 중복 UX 개선)
- QuickLoginSection: 계정 편집 폼 버튼 순서 "수정 → 취소"에서 "취소 → 수정"으로 변경
- DnD library: `svelte-dnd-action` → `@dnd-kit/svelte` (via uikit)
- Quick login add-form position: above buttons → below buttons
- Drag handle UI: restored bar-style with grip dots
- CSS hardcoded values → theme token references (transition, z-index, shadow)
- Card hover effect: header color change → background color + border
- `type-check` script: added `svelte-check`

### Removed

- Calculator 컴포넌트 제거 (테스트용 섹션)

### Fixed

- Chrome Extension 팝업에서 중첩 스크롤바가 생기는 버그 수정 (`.app-content`에서 `max-height: 600px`, `overflow-y: auto` 제거)
- QuickLoginSection: 편집 모드에서 팝업 닫힘 시 미저장 변경사항이 스토리지에 유지되던 버그 수정 (batch mode 도입)
- 섹션 설정 팝업이 App 영역 클릭 시 닫히지 않던 버그 수정 (`SectionSettings`)
- Drag handle hover scope (only bar, not entire card content)
- Drag feedback color (fallback values for theme scope issue)
- Button height shrink in edit mode

### Tests

- 서버 관리 관련 테스트 전면 보강 (EC Server Manager 2.2.0 `serverChange.js` 로직 기준, 총 175개 → 259개)
  - url_service.test.ts: 31개 → 70개 (parseEcountUrl stage/test/zeus/ec3/unknown·-dev URL·쿼리/hash 복합; buildEc5Url/buildEc3Url/buildStageUrl/buildDevUrl 분기·엣지케이스; inputLogin·switchV3/V5TestServer 다양한 패턴)
  - page_actions.test.ts: 13개 → 30개 (debugAndGetPageInfo 12개 mock 시나리오, top undefined/null 포함)
  - server_ui.svelte.test.ts: 신규 13개 (initializeServerUi, resetServerUi 스토어 단위 테스트)
  - tab_service.test.ts: 12개 → 17개 (엣지케이스 추가)
  - server_change_flow.test.ts: 4개 → 10개 (test/zeus/-dev/EC3 환경 서버 변경 플로우)
  - dev_mode_flow.test.ts: 3개 → 7개 (devMode 레거시 분기)

## [2.2.2] - 2026-03-09

### Added

- 사용자 스크립트 실행 시점 선택 기능 추가
  - `document_start` (페이지 로드 전): Tampermonkey의 `@run-at document-start`와 동일
  - `document_idle` (페이지 로드 후, 기본값): 기존 동작과 동일
- 스크립트 편집 UI에 "실행 시점" 선택 드롭다운 추가

### Changed

- `UserScript` 타입의 `run_at` 필드가 `'document_start' | 'document_idle'` union 타입으로 변경
- Background script의 스크립트 실행 로직이 `run_at` 설정에 따라 분기 처리되도록 개선

### Technical Details

- Chrome Extension의 `tabs.onUpdated` 이벤트의 `status` 값(`loading`/`complete`)으로 실행 시점 제어
- 기존 스크립트는 자동으로 `document_idle`로 처리되어 호환성 유지

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
