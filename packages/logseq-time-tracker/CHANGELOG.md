# Changelog

## [0.1.0] - 2026-03-24

### Added
- Phase 1 통합: initializeApp + AppContext 기반 앱 초기화
- App.svelte: Timer, JobList, ToastContainer, EmptyState, ReasonModal 통합
- beforeunload 이벤트에서 timer_service.dispose() 호출

### Changed
- PocTest 마운트 → App.svelte + AppContext 마운트로 전환
