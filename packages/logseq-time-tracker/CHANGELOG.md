# Changelog

## [0.1.1] - 2026-03-27

### Fixed

- ReasonModal z-index 버그 수정 (Toolbar 모드에서 dropdown-backdrop과 동일 레벨로 모달 버튼이 클릭되지 않던 문제)
- e2e helpers: DOM click 워크어라운드 제거, 정상 포인터 클릭으로 복원
- uikit 테마(`light_theme`)를 `document.body` 대신 `#app`에 적용하도록 수정 (uikit `global.css.ts`가 `html`, `body`에 배경색을 설정해 플러그인 iframe이 전체 하얀색으로 덮이던 문제; CSS 변수는 `#app` 트리에만 상속)
- uikit `global.css.ts`의 `html { overflowY: 'auto', scrollbarGutter: 'stable' }` 사이드이펙트로 Logseq 플러그인 iframe에 스크롤바가 나타나던 문제 수정 (`main.ts`에 `document.documentElement.style.overflow = 'hidden'` 인라인 적용으로 vanilla-extract CSS보다 높은 특이성 확보; `e2e/test-app.ts`에 동일 테마 및 overflow hidden 적용으로 E2E에서 z-index·스크롤 동작 일치; VRT 베이스라인 갱신)

### Added

- UC-VRT-004 VRT 테스트 추가
- `@personal/uikit`(workspace) 의존성 추가
- UC-PLUGIN-006(`#app`에 `light_theme` 적용), UC-PLUGIN-007(body에는 미적용) 단위 테스트 추가
- UC-PLUGIN-008(HTML `overflow` hidden 검증) 단위 테스트 추가

## [0.1.0] - 2026-03-24

### Added
- Phase 1 통합: initializeApp + AppContext 기반 앱 초기화
- App.svelte: Timer, JobList, ToastContainer, EmptyState, ReasonModal 통합
- beforeunload 이벤트에서 timer_service.dispose() 호출

### Changed
- PocTest 마운트 → App.svelte + AppContext 마운트로 전환
