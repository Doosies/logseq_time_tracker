# Changelog

## [Unreleased]

### Added
- 포괄적 테스트 커버리지 (테스트 파일 23개, 약 95개 케이스, UC-ID 추적)
- 단위 테스트: `field_component_registry` (UC-FIELD-001~004), `before_unload` (UC-UTIL-009~011), Memory 저장소 `job_category`·`data_field`·`settings`·`history` (UC-MEM-019~036)
- 필드 컴포넌트 테스트: StringField, BooleanField, DecimalField, EnumField, DateField, DatetimeField, RelationField, FieldRenderer (UC-FIELD-005~038)
- 컴포넌트 테스트: EmptyState, TimeEntryList, CustomFieldEditor, CustomFieldManager, FullView, InlineView
- 통합 테스트: `custom_field_lifecycle` (UC-INTG-001~004), `export_workflow` (UC-INTG-005~007), `template_operations` (UC-INTG-008~010)
- 테스트용 Svelte 스텁: `date_picker_stub`, `job_selector_stub`, `elapsed_timer_stub`

## [0.2.0] - 2026-03-24

### Added
- SQLite 영속화 계층 (sql.js + OPFS/IndexedDB)
- IStorageBackend 인터페이스 및 OPFS/IndexedDB 구현
- Forward-only 스키마 마이그레이션 (MigrationRunner)
- 9개 SQLite Repository (Job, Category, TimeEntry, History, Settings, ExternalRef, JobCategory, Template, DataField)
- SqliteUnitOfWork (네이티브 트랜잭션, 중첩 조인)
- StorageStateMachine (sqlite ↔ memory_fallback 전이)
- StorageManager (초기화/런타임 실패 시 Memory fallback, 복구 로직)
- WebLocksManager (멀티탭 동시 접근 제어)
- JobCategoryService (Job-Category M:N 링크, 기본 카테고리 관리)
- DataExportService (JSON 전체 export/import, 버전 마이그레이션)
- beforeunload 타이머 상태 저장
- Storage PoC 검증 유틸 (sql.js WASM, OPFS, IndexedDB)

### Changed
- initializeApp에 storage_mode 분기 추가 (memory/sqlite)
- CategoryService.deleteCategory에 TimeEntry/JobCategory 참조 검사 활성화
- createServices 팩토리에 JobCategoryService, DataExportService 추가
- MemoryUnitOfWork에 MemoryJobCategoryRepository 추가 (스텁 교체)

### Fixed
- MemoryUnitOfWork 트랜잭션 스냅샷에 job_categories 포함

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
