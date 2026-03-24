# Changelog

## [0.1.0] - 2026-03-24

### Added
- 코어 도메인 타입 정의 (Job, Category, TimeEntry, JobHistory, ExternalRef, JobCategory, JobTemplate)
- FSM 기반 작업 상태 관리 (StatusKind: pending/in_progress/paused/cancelled/completed)
- 커스텀 에러 체계 (TimeTrackerError, ValidationError, StateTransitionError, StorageError, TimerError, ReferenceIntegrityError)
- UI 문자열 상수 (한국어) 및 설정 상수
- 유틸리티 함수 (sanitizeText, getElapsedMs, formatDuration, formatLocalDateTime, generateId)
- Repository 패턴 기반 저장소 레이어 (9개 인터페이스 + IUnitOfWork)
- Memory 구현체 (MemoryUnitOfWork, structuredClone 격리, 트랜잭션/롤백)
- 서비스 레이어 (HistoryService, JobService, CategoryService, TimerService)
- 서비스 팩토리 (createServices)
- Svelte 5 Runes 기반 반응형 스토어 (timer_store, job_store, toast_store)
- vanilla-extract 기반 UI 컴포넌트 (Timer, TimerDisplay, TimerButton, JobList, ReasonModal, ToastContainer, EmptyState)
- 앱 초기화 시퀀스 (initializeApp, AppContext)
- Logseq 플러그인 통합 (App.svelte, main.ts)
- 단위/통합/컴포넌트 테스트 155개 (Vitest)

### Removed
- React 기반 레거시 패키지 (packages/time-tracker)
- Phase 0 PoC 코드 (PocTest.svelte)
- pnpm-workspace.yaml에서 React 관련 catalog 항목
