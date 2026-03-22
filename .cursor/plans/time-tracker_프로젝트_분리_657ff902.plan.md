---
name: time-tracker 프로젝트 분리
overview: packages/time-tracker를 플랫폼 무관 코어 라이브러리(time-tracker-core)와 Logseq 전용 플러그인(logseq-time-tracker)으로 분리하고, 타이머/시간기록/통계/영속화 기능을 전체 구현합니다.
todos:
    - id: p0-figjam-flow
      content: '[직렬-1] FigJam에 사용자 흐름 다이어그램 생성 — 잡생성→정보입력→트래킹시작, 상태전환 플로우 (담당: developer)'
      status: pending
    - id: p0-figjam-toolbar
      content: '[병렬-1] FigJam에 툴바 UI 와이어프레임 — 진행중 Job 표시, 시작/일시정지, 작업 스위칭 (담당: developer, 선행: p0-figjam-flow)'
      status: pending
    - id: p0-figjam-fullscreen
      content: '[병렬-2] FigJam에 풀화면 UI 와이어프레임 — Job 목록, 통계, 설정, 템플릿 편집 (담당: developer, 선행: p0-figjam-flow)'
      status: pending
    - id: p0-figjam-components
      content: '[병렬-3] FigJam에 공통 컴포넌트 와이어프레임 — Timer, 셀렉터, 데이트피커, JobList (담당: developer, 선행: p0-figjam-flow)'
      status: pending
    - id: p0-figjam-inline
      content: '[병렬-4] FigJam에 페이지 인라인 UI 와이어프레임 — 현재 페이지 기반 시작 버튼, 카테고리 선택 (담당: developer, 선행: p0-figjam-flow)'
      status: pending
    - id: p0-review
      content: '[직렬-2] 사용자 FigJam 디자인 검토 및 승인 (담당: planner)'
      status: pending
    - id: p1-scaffold-core
      content: '[직렬-3] packages/time-tracker-core 스캐폴딩 — package.json, tsconfig, vite.config, svelte.config (담당: developer, 선행: p0-review)'
      status: pending
    - id: p1-scaffold-logseq
      content: '[직렬-4] packages/logseq-time-tracker 스캐폴딩 — core 의존 추가, Logseq 설정 (담당: developer, 선행: p1-scaffold-core)'
      status: pending
    - id: p1-types
      content: '[직렬-5] time-tracker-core 핵심 타입 정의 — Job, TimeEntry, JobStatus, Category (담당: developer, 선행: p1-scaffold-core)'
      status: pending
    - id: p1-timer-service
      content: '[직렬-6] timer_service + timer_store (Svelte 5 runes) 구현 (담당: developer, 선행: p1-types)'
      status: pending
    - id: p1-memory-adapter
      content: '[직렬-7] StorageAdapter 인터페이스 + MemoryStorageAdapter 구현 (담당: developer, 선행: p1-types)'
      status: pending
    - id: p1-unit-tests
      content: '[직렬-8] Phase 1 단위 테스트 — TimerService(start/stop/pause/resume, 진행중 1개 제약), MemoryStorageAdapter(CRUD), StatusKind 전환 검증 (담당: qa, 선행: p1-timer-service, p1-memory-adapter)'
      status: pending
    - id: p1-timer-component
      content: '[직렬-9] Timer Svelte 컴포넌트 — FigJam 디자인 기반, 시작/정지/일시정지, 경과시간 표시 (담당: developer, 선행: p1-unit-tests)'
      status: pending
    - id: p1-integration-tests
      content: '[직렬-10] Phase 1 통합 테스트 — TimerService+Storage 연동, TimerStore+Service 반응형 동기화, Timer 컴포넌트 렌더링/버튼 동작 (담당: qa, 선행: p1-timer-component)'
      status: pending
    - id: p1-entry-point
      content: '[직렬-11] logseq-time-tracker 진입점 — main.ts + App.svelte + core 연동 (담당: developer, 선행: p1-scaffold-logseq, p1-timer-component)'
      status: pending
    - id: p1-plugin-tests
      content: '[직렬-12] Phase 1 플러그인 테스트 — main.ts Logseq API 모킹 테스트, App+core 통합 렌더링 (담당: qa, 선행: p1-entry-point)'
      status: pending
    - id: p1-qa-gate
      content: '[직렬-13] Phase 1 QA 게이트 — format, lint, type-check, build, 커버리지 80%+ 확인 (담당: qa, 선행: p1-plugin-tests)'
      status: pending
    - id: p1-security
      content: '[직렬-14] Phase 1 보안 검증 (담당: security, 선행: p1-qa-gate)'
      status: pending
    - id: p1-docs
      content: '[직렬-15] Phase 1 문서화 — CHANGELOG, README (담당: docs, 선행: p1-security)'
      status: pending
    - id: p1-commit
      content: '[직렬-16] Phase 1 커밋 (담당: git-workflow, 선행: p1-docs)'
      status: pending
    - id: p1-feedback
      content: '[직렬-17] Phase 1 피드백 확인 및 Phase 2 준비 (담당: planner, 선행: p1-commit)'
      status: pending
    - id: p2-impl
      content: '[직렬-18] Phase 2 구현: OPFS+SQLite Adapter, JobService, HistoryService, 상태 FSM (담당: developer)'
      status: pending
    - id: p2-unit-tests
      content: '[직렬-19] Phase 2 단위 테스트: JobService CRUD/전환, HistoryService 기록/조회, SQLiteAdapter SQL 정합성 (담당: qa, 선행: p2-impl)'
      status: pending
    - id: p2-integration-tests
      content: '[직렬-20] Phase 2 통합 테스트: 상태 FSM 전체 흐름(pending→completed), Job+History 연동, SQLite 영속화→재시작 유지 (담당: qa, 선행: p2-unit-tests)'
      status: pending
    - id: p2-e2e
      content: '[직렬-21] Phase 2 E2E 테스트 작성: 기본 타이머 시작/정지, 작업 전환+사유 입력 플로우 (담당: qa, 선행: p2-integration-tests)'
      status: pending
    - id: p3-impl
      content: '[직렬-22] Phase 3 구현: FigJam 기반 셀렉터, 데이트피커, Job 생성 플로우, 템플릿 시스템 (담당: developer)'
      status: pending
    - id: p3-component-tests
      content: '[직렬-23] Phase 3 컴포넌트 테스트: 셀렉터(폴더중첩/검색), 데이트피커(범위/포맷), JobCreation 폼(입력검증/제출), 템플릿 편집 (담당: qa, 선행: p3-impl)'
      status: pending
    - id: p3-e2e
      content: '[직렬-24] Phase 3 E2E 테스트: 잡생성→정보입력→페이지생성→트래킹시작 전체 플로우 (담당: qa, 선행: p3-component-tests)'
      status: pending
    - id: p4-impl
      content: '[직렬-25] Phase 4 구현: eCount 연동, 작업별/카테고리별 통계, 폴더/검색 셀렉터 (담당: developer)'
      status: pending
    - id: p4-tests
      content: '[직렬-26] Phase 4 통합/E2E 테스트: 통계 집계 정확성, 풀화면 통계 표시, 툴바 상호작용 (담당: qa, 선행: p4-impl)'
      status: pending
    - id: p5-cleanup
      content: '[직렬-27] Phase 5: 기존 time-tracker 삭제, 모노레포 정리 (담당: developer)'
      status: pending
    - id: p5-regression
      content: '[직렬-28] Phase 5 회귀 테스트: 전체 테스트 스위트 실행, 커버리지 최종 확인 (담당: qa, 선행: p5-cleanup)'
      status: pending
    - id: p5-docs
      content: '[직렬-29] Phase 5 최종 문서화 (담당: docs, 선행: p5-regression)'
      status: pending
isProject: false
---

# time-tracker 프로젝트 분리 및 전체 구현

## 현재 상태

- `packages/time-tracker`는 React 기반 Logseq 플러그인 **스캐폴딩** (카운터 데모만 존재, 시간 추적 로직 없음)
- `@logseq/libs`는 프레임워크 무관 — Svelte 전환에 기술적 제약 없음
- 모노레포에 Svelte 5 인프라 이미 구축됨 ([config/vite.shared.ts](config/vite.shared.ts), [config/svelte.config.shared.js](config/svelte.config.shared.js), [config/tsconfig.svelte.json](config/tsconfig.svelte.json))

## 아키텍처

```mermaid
graph TB
  subgraph core ["packages/time-tracker-core"]
    types["types/ (TimeEntry, Timer, Category)"]
    services["services/ (timer, entry, report, storage interface)"]
    stores["stores/ (Svelte 5 runes wrapping services)"]
    components["components/ (Timer, EntryForm, EntryList, Report)"]
    types --> services
    services --> stores
    stores --> components
  end

  subgraph logseq ["packages/logseq-time-tracker"]
    main["main.ts (@logseq/libs entry)"]
    adapter["adapters/logseq_storage.ts"]
    app["App.svelte (core 컴포넌트 조합)"]
    main --> app
    adapter --> app
  end

  core --> logseq
  uikit["@personal/uikit"] --> core
```

## 패키지 구조

### 1. `packages/time-tracker-core` — 플랫폼 무관 코어

```
packages/time-tracker-core/
├── src/
│   ├── types/
│   │   ├── timer.ts           # Timer, TimerState, TimerEvent
│   │   ├── entry.ts           # TimeEntry, Category, Tag
│   │   ├── report.ts          # DailySummary, WeeklySummary
│   │   └── index.ts
│   ├── services/
│   │   ├── timer_service.ts   # 타이머 시작/정지/일시정지 로직
│   │   ├── entry_service.ts   # 시간 기록 CRUD
│   │   ├── report_service.ts  # 통계 계산 (일별/주별)
│   │   └── index.ts
│   ├── storage/
│   │   ├── storage_adapter.ts # 추상 인터페이스 (StorageAdapter)
│   │   ├── memory_adapter.ts  # 테스트/기본용 인메모리 구현
│   │   ├── json_file_adapter.ts # JSON 파일 기반 (Node.js/Logseq fs)
│   │   └── index.ts
│   ├── stores/
│   │   ├── timer_store.svelte.ts   # Svelte 5 runes ($state, $derived)
│   │   ├── entries_store.svelte.ts
│   │   ├── report_store.svelte.ts
│   │   └── index.ts
│   ├── components/
│   │   ├── Timer/             # 타이머 표시 + 조작 버튼
│   │   ├── TimeEntryForm/     # 수동 시간 기록 입력
│   │   ├── TimeEntryList/     # 기록 목록 표시
│   │   ├── ReportView/        # 일별/주별 통계
│   │   └── index.ts
│   └── index.ts               # Public API (types, services, stores, components)
├── package.json
├── svelte.config.js           # config/svelte.config.shared.js 재사용
├── tsconfig.json              # config/tsconfig.svelte.json 확장
└── vite.config.ts             # config/vite.shared.ts 기반 라이브러리 빌드
```

### 2. `packages/logseq-time-tracker` — Logseq 플러그인

```
packages/logseq-time-tracker/
├── src/
│   ├── main.ts                # logseq.ready() 진입점
│   ├── App.svelte             # 메인 UI (core 컴포넌트 조합)
│   ├── adapters/
│   │   └── logseq_storage_adapter.ts  # Logseq 파일/블록 API 기반 저장
│   └── utils/
│       └── logseq_helpers.ts  # Logseq API 래퍼
├── index.html
├── logo.svg
├── package.json               # deps: @personal/time-tracker-core, @logseq/libs
├── svelte.config.js
├── tsconfig.json
└── vite.config.ts             # vite-plugin-logseq 포함
```

## 설계 문서

상세 설계는 `docs/design/` 디렉터리에 정리되어 있습니다:

- [00-overview.md](docs/design/00-overview.md) — 프로젝트 개요, 목표, 패키지 분리 구조
- [01-requirements.md](docs/design/01-requirements.md) — MoSCoW 기반 기능/비기능 요구사항
- [02-architecture.md](docs/design/02-architecture.md) — Hexagonal Architecture, 레이어, 의존성
- [03-data-model.md](docs/design/03-data-model.md) — Job, TimeEntry, Category, Status, History, Template
- [04-state-management.md](docs/design/04-state-management.md) — Job 상태 FSM, "진행중 1개" 제약
- [05-storage.md](docs/design/05-storage.md) — Storage Adapter 패턴, OPFS+SQLite, Logseq Adapter
- [06-ui-ux.md](docs/design/06-ui-ux.md) — 툴바, 풀화면, 셀렉터, 데이트피커, 템플릿
- [07-test-strategy.md](docs/design/07-test-strategy.md) — 단위/통합/E2E 테스트 전략, Phase별 범위, 인프라

## 핵심 설계 결정

- **Core ↔ Plugin 분리**: `time-tracker-core`는 Logseq 의존 없음. 껍데기만 Logseq
- **진행중 1개 제약**: `in_progress` 상태 Job은 시스템 전체에서 1개만 허용
- **Storage Adapter 패턴**: 구현체(Memory, OPFS+SQLite, Logseq) 교체 가능
- **Svelte 5 Runes**: 기존 모노레포 인프라 재사용
- **JobHistory + reason 필수**: 상태 전환 시 사유 기록 강제

## 구현 단계 (디자인 → 프로토타입 → 전체 구현)

### Phase 0: FigJam UI 디자인 (코드 구현 전)

- 에이전트가 FigJam에 와이어프레임/다이어그램 생성, 사용자가 검토/승인
- **사용자 흐름 다이어그램**: 잡생성→정보입력→트래킹시작, 상태전환 플로우
- **툴바 와이어프레임**: 진행중 Job 표시, 시작/일시정지, 작업 스위칭
- **풀화면 와이어프레임**: Job 목록, 통계, 설정, 템플릿 편집
- **공통 컴포넌트**: Timer, 셀렉터(폴더 중첩+검색), 데이트피커, JobList
- **페이지 인라인**: 현재 페이지 기반 시작 버튼, 카테고리 선택

### Phase 1: 프로토타입 (FigJam 승인 후)

- 두 패키지 스캐폴딩 + 핵심 타입 정의
- TimerService + TimerStore (Svelte 5 runes)
- MemoryStorageAdapter
- **단위 테스트**: TimerService, MemoryStorageAdapter, StatusKind 전환 검증
- Timer Svelte 컴포넌트 — **FigJam 디자인 기반**
- **통합 테스트**: Service+Storage 연동, Store 반응형, 컴포넌트 렌더링/동작
- logseq-time-tracker 진입점 (main.ts + App.svelte)
- **플러그인 테스트**: Logseq API 모킹, App+core 통합
- QA 게이트 (커버리지 80%+) → Security → Docs → Commit → 피드백

### Phase 2: 영속화 & Job 관리

- OPFS+SQLite Adapter, JobService, HistoryService, 상태 FSM
- **단위 테스트**: JobService CRUD/전환, HistoryService, SQLiteAdapter
- **통합 테스트**: FSM 전체 흐름, SQLite 영속화→재시작
- **E2E 테스트**: 기본 타이머 시작/정지, 작업 전환 플로우

### Phase 3: UI 고도화

- 셀렉터, 데이트피커, Job 생성 플로우, 템플릿 시스템
- **컴포넌트 테스트**: 셀렉터(폴더/검색), 데이트피커, JobCreation 폼
- **E2E 테스트**: 잡생성→정보입력→트래킹시작 전체 플로우

### Phase 4: 통계 & 연동

- eCount 연동, 작업별/카테고리별 통계, 폴더/검색 셀렉터
- **통합/E2E 테스트**: 통계 집계, 풀화면 표시, 툴바 상호작용

### Phase 5: 정리

- 기존 `packages/time-tracker` 삭제, 모노레포 정리
- **회귀 테스트**: 전체 테스트 스위트 실행, 커버리지 최종 확인
- 최종 문서화
