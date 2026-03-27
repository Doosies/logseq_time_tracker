# Changelog

## [0.1.1] - 2026-03-27

### Fixed

- ReasonModal z-index 버그 수정 (Toolbar 모드에서 dropdown-backdrop과 동일 레벨로 모달 버튼이 클릭되지 않던 문제)
- e2e helpers: DOM click 워크어라운드 제거, 정상 포인터 클릭으로 복원

### Added

- UC-VRT-004 VRT 테스트 추가

## [0.1.0] - 2026-03-24

### Added
- Phase 1 통합: initializeApp + AppContext 기반 앱 초기화
- App.svelte: Timer, JobList, ToastContainer, EmptyState, ReasonModal 통합
- beforeunload 이벤트에서 timer_service.dispose() 호출

### Changed
- PocTest 마운트 → App.svelte + AppContext 마운트로 전환
