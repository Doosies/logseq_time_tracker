# 테스트 전략

**작성일**: 2026-03-15
**버전**: 1.0

---

## 1. 개요

두 패키지(`time-tracker-core`, `logseq-time-tracker`)의 테스트 전략을 정의합니다. 단위/통합/E2E 3단계로 구성하며, **코어는 Logseq 무관하게**, **플러그인은 Logseq API 모킹 기반으로** 테스트합니다.

> **관련 문서 (SSOT)**
>
> - 상세 BDD 명세 (Given-When-Then): 각 패키지 [`__test_specs__/`](../../packages/time-tracker-core/__test_specs__/) (`time-tracker-core`, `logseq-time-tracker`)
> - Phase별 유즈케이스 인덱스: [08-test-usecases.md](08-test-usecases.md)
> - 아키텍처 (서비스 목록/책임): [02-architecture.md](02-architecture.md)
> - 데이터 모델 (필드/제약): [03-data-model.md](03-data-model.md)
> - FSM 전환 규칙: [04-state-management.md §상태 머신](04-state-management.md)
> - 영속화 (Repository/UoW): [05-storage.md](05-storage.md)

---

## 2. 테스트 워크플로우

### 유즈케이스 선작성 → 테스트 코드 후작성

```
1. 유즈케이스 명세 — 패키지 `__test_specs__/{level}/{domain}.md`에서 BDD Given-When-Then 정의; Phase·ID 요약은 [08-test-usecases.md](08-test-usecases.md)
   └── 코드 없이 "무엇을 검증하는가" 명세

2. 세부 테스트 코드 구현
   └── 유즈케이스 ID를 테스트 describe/it에 매핑
   └── AAA 패턴 (Arrange-Act-Assert)으로 구현
```

- 새 기능 구현 시: 유즈케이스 먼저 작성 → 사용자 확인 → 테스트 코드 구현
- 유즈케이스 ID(`UC-TIMER-001` 등)를 테스트 코드의 describe/it 블록에 명시하여 추적성 유지
- 상세 BDD·ID: 각 패키지 `__test_specs__/` 및 Phase 인덱스 [08-test-usecases.md](08-test-usecases.md) 참조

---

## 3. 테스트 피라미드

```
        ╱  E2E  ╲         Logseq 환경에서 플러그인 전체 플로우
       ╱─────────╲
      ╱  통합 테스트 ╲      서비스 간 협업, Store + Service + Adapter
     ╱───────────────╲
    ╱   단위 테스트     ╲    서비스, 스토어, 유틸리티, 타입 검증
   ╱─────────────────────╲
```

| 레벨     | 비율 | 도구                             | 대상                                |
| -------- | ---- | -------------------------------- | ----------------------------------- |
| **단위** | 60%  | Vitest                           | 서비스, 스토어, 유틸리티, 타입 검증 |
| **통합** | 30%  | Vitest + @testing-library/svelte | 서비스 간 협업, 컴포넌트 + 스토어   |
| **E2E**  | 10%  | Playwright                       | Logseq 플러그인 핵심 플로우         |
| **VRT**  | 보조 | Playwright `toHaveScreenshot`    | 주요 UI 시각 회귀 (스크린샷 비교)   |

---

## 4. 패키지별 테스트 범위

> 각 항목의 상세 시나리오는 각 패키지 `__test_specs__/` 및 Phase 인덱스 [08-test-usecases.md](08-test-usecases.md) 참조

### 4.1 `time-tracker-core` (Logseq 무관)

#### 단위 테스트

| 대상                     | 유즈케이스 ID      | 커버리지 목표 |
| ------------------------ | ------------------ | ------------- |
| **TimerService**         | UC-TIMER-001 ~ 007 | 90%+          |
| **JobService**           | UC-JOB-001 ~ 005   | 90%+          |
| **HistoryService**       | UC-HIST-001 ~ 004  | 90%+          |
| **MemoryStorageAdapter** | UC-STORE-001 ~ 004 | 90%+          |
| **타입 검증**            | UC-TYPE-001 ~ 004  | 80%+          |

#### 엣지 케이스 테스트

| 대상                        | 유즈케이스 ID | 커버리지 목표 |
| --------------------------- | ------------- | ------------- |
| **빠른 연속 상태 전환**     | UC-EDGE-001   | 90%+          |
| **DST 전환 시 duration**    | UC-EDGE-002   | 90%+          |
| **Category 깊이 경계**      | UC-EDGE-003   | 90%+          |
| **custom_fields JSON 파싱** | UC-EDGE-004   | 90%+          |
| **ExternalRef 중복 검증**   | UC-EDGE-005   | 90%+          |
| **pending→completed 사후**  | UC-EDGE-006   | 90%+          |
| **비정상 종료 복구**        | UC-EDGE-007   | 90%+          |
| **Job 삭제 cascade**        | UC-EDGE-008   | 90%+          |

#### 통합 테스트

| 대상                       | 유즈케이스 ID    |
| -------------------------- | ---------------- |
| **FSM 전체 흐름**          | UC-FSM-001 ~ 004 |
| **Store + Service 반응형** | UC-FSM-005 ~ 006 |

#### Svelte 컴포넌트 테스트

| 컴포넌트          | 유즈케이스 ID   |
| ----------------- | --------------- |
| **Timer**         | UC-UI-001 ~ 003 |
| **JobList**       | UC-UI-004 ~ 006 |
| **TimeEntryForm** | UC-UI-007 ~ 008 |
| **셀렉터**        | UC-UI-009 ~ 010 |
| **데이트피커**    | UC-UI-011 ~ 012 |

### 4.2 `logseq-time-tracker` (Logseq API 모킹)

#### 단위/통합 테스트

| 대상                     | 유즈케이스 ID       |
| ------------------------ | ------------------- |
| **플러그인 초기화**      | UC-PLUGIN-001 ~ 003 |
| **LogseqStorageAdapter** | UC-PLUGIN-004 ~ 005 |
| **App + core 통합**      | UC-PLUGIN-006       |

#### E2E 테스트 (Playwright)

| 시나리오             | 유즈케이스 ID |
| -------------------- | ------------- |
| **타이머 시작/정지** | UC-E2E-001    |
| **작업 전환**        | UC-E2E-002    |
| **잡 생성 플로우**   | UC-E2E-003    |
| **기간별 통계**      | UC-E2E-004    |
| **툴바 상호작용**    | UC-E2E-005    |

**E2E 범위 분리**:

- **`time-tracker-core` E2E** (UC-E2E-001 ~ 005): 독립 웹앱 모드에서 실행. MemoryAdapter 사용. Logseq API 불필요. **CI에서 자동 실행 가능**.
- **`logseq-time-tracker` E2E**: Logseq 실행 환경 필요. 인라인 UI, 페이지→Job 매핑, 플러그인 생명주기 등 Logseq 특화 시나리오. **수동 또는 별도 CI 단계에서 실행**.

**E2E 테스트 환경: 독립 웹앱 모드**

Logseq 실행 환경에 의존하지 않고 E2E 테스트를 수행하기 위해, `time-tracker-core`를 독립 웹앱으로 마운트하는 테스트 환경을 구성합니다.

```
packages/time-tracker-core/
├── e2e/
│   ├── app.html             # 테스트용 HTML 셸
│   ├── test_app.ts           # MemoryUoW + 시드 데이터로 앱 마운트
│   ├── timer.spec.ts
│   └── playwright.config.ts
```

- `test_app.ts`에서 `MemoryUnitOfWork`와 시드 데이터를 주입하여 독립 실행
- Logseq API 모킹 불필요 (core 패키지만 테스트)
- Playwright가 Vite dev 서버를 `webServer`로 실행
- CI 환경에서 headless 모드로 자동 실행 가능

### 4.3 성능 테스트

| 대상                    | 유즈케이스 ID   | 기준       |
| ----------------------- | --------------- | ---------- |
| **주요 액션 응답 시간** | UC-PERF-001~002 | 200ms 이내 |
| **대량 목록 렌더링**    | UC-PERF-003     | 500ms 이내 |
| **SQLite 대량 쿼리**    | UC-PERF-004     | 500ms 이내 |

### 4.4 접근성 테스트

| 대상                  | 유즈케이스 ID   | 기준                |
| --------------------- | --------------- | ------------------- |
| **키보드 네비게이션** | UC-A11Y-001     | Tab으로 전체 접근   |
| **모달 포커스 트랩**  | UC-A11Y-002~003 | 포커스 순환/복귀    |
| **ARIA 속성**         | UC-A11Y-004     | role, aria-live     |
| **색상 대비**         | UC-A11Y-005     | WCAG 2.1 AA (4.5:1) |

---

## 5. Phase별 테스트 범위

### Phase 1 (프로토타입)

**단위 테스트**:

- TimerService: start/stop/pause/resume, 진행중 1개 제약
- MemoryStorageAdapter: 전체 CRUD 메서드
- 타입 검증: StatusKind 전환 유효성

**엣지 케이스 테스트**:

- 빠른 연속 상태 전환 (100ms 간격 start/stop 반복)
- Category 깊이 10 경계값 (10 성공, 11 실패)
- custom_fields JSON 파싱 실패 시 graceful handling
- reason 빈 문자열/공백만 입력 시 거부

**통합 테스트**:

- TimerService + MemoryStorageAdapter 연동
- TimerStore + TimerService 반응형 동기화

**컴포넌트 테스트**:

- Timer: 렌더링, 버튼 동작, 경과시간 표시

**E2E**: 없음 (프로토타입 단계)

**커버리지 목표**: 80%+ (Line Coverage)

### Phase 2 (영속화 & Job)

**단위 테스트**:

- JobService: CRUD, 상태 전환
- HistoryService: 기록 생성, 조회
- OpfsSqliteStorageAdapter: SQL 쿼리 정합성

**엣지 케이스 테스트**:

- DST 전환 시점의 duration_seconds 정합성
- ExternalRef 동일 (job_id, system_key) 중복 삽입 거부
- Job 삭제 시 ExternalRef cascade 삭제 확인
- pending → completed 사후 기록 흐름
- 비정상 종료 후 ActiveTimerState 복구 (paused 상태)

**통합 테스트**:

- 상태 FSM 전체 흐름 (pending → completed)
- JobService + HistoryService 자동 기록
- SQLite 영속화 → 재시작 후 데이터 유지

**E2E**: 기본 타이머 시작/정지 플로우

### Phase 3 (UI 고도화)

**컴포넌트 테스트**:

- 셀렉터: 폴더 중첩, 검색, 선택
- 데이트피커: 날짜 선택, 범위 검증
- JobCreation: 폼 입력, 제출, 템플릿 적용

**E2E**: 잡 생성 → 정보 입력 → 트래킹 시작

**VRT**: 주요 화면·상태에 대해 Playwright `toHaveScreenshot` 기반 시각 회귀 (UC-VRT-001~003, `logseq-time-tracker/__test_specs__/vrt/`)

### Phase 4~5 (통계 & 정리)

**통합 테스트**:

- 통계 서비스: 기간별/작업별/카테고리별 집계
- eCount 연동 어댑터 (모킹)

**E2E**: 풀화면 통계, 툴바 상호작용

---

## 6. 테스트 인프라

### 도구

| 도구                        | 용도                   | 패키지              |
| --------------------------- | ---------------------- | ------------------- |
| **Vitest**                  | 단위/통합 테스트 러너  | 양쪽                |
| **@testing-library/svelte** | Svelte 컴포넌트 테스트 | 양쪽                |
| **@vitest/coverage-v8**     | 커버리지 측정          | 양쪽                |
| **Playwright**              | E2E 테스트             | logseq-time-tracker |
| **Playwright toHaveScreenshot** | VRT (시각 회귀)    | logseq-time-tracker (`__test_specs__/vrt/`) |
| **jsdom**                   | DOM 환경 시뮬레이션    | 양쪽                |

### 디렉터리 구조

```
packages/time-tracker-core/
├── src/
│   ├── services/
│   │   └── __tests__/
│   │       ├── timer_service.test.ts      # 단위
│   │       └── timer_service.integration.test.ts  # 통합
│   ├── adapters/
│   │   └── __tests__/
│   │       └── memory_storage_adapter.test.ts
│   ├── stores/
│   │   └── __tests__/
│   │       └── timer_store.test.ts
│   └── components/
│       └── Timer/
│           └── __tests__/
│               ├── Timer.test.ts          # 컴포넌트 테스트
│               └── Timer.stories.ts       # Storybook
└── vitest.config.ts

packages/logseq-time-tracker/
├── src/
│   └── __tests__/
│       ├── main.test.ts                   # 플러그인 초기화 테스트
│       └── app.integration.test.ts        # App + core 통합
├── e2e/
│   ├── timer.spec.ts                      # E2E: 타이머
│   ├── job_switch.spec.ts                 # E2E: 작업 전환
│   └── job_creation.spec.ts               # E2E: 잡 생성
├── vitest.config.ts
└── playwright.config.ts
```

### 공유 테스트 유틸리티 (test-utils)

테스트 코드의 DRY와 일관성을 위해, 공유 팩토리 함수와 헬퍼를 제공합니다.

```
packages/time-tracker-core/src/__test_utils__/
├── factories.ts       # 엔티티 팩토리 함수
├── setup.ts           # 공통 테스트 설정 (MemoryUoW + 서비스 조립)
└── index.ts           # re-export
```

**팩토리 함수**:

```typescript
// factories.ts
export function createTestJob(overrides?: Partial<Job>): Job {
    return {
        id: crypto.randomUUID(),
        title: 'Test Job',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

export function createTestCategory(overrides?: Partial<Category>): Category {
    return {
        id: crypto.randomUUID(),
        name: 'Test Category',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...overrides,
    };
}

export function createTestTimeEntry(overrides?: Partial<TimeEntry>): TimeEntry {
    const started_at = new Date().toISOString();
    const ended_at = new Date(Date.now() + 3600_000).toISOString();
    return {
        id: crypto.randomUUID(),
        job_id: 'job-1',
        category_id: 'cat-1',
        started_at,
        ended_at,
        duration_seconds: 3600,
        is_manual: false,
        created_at: started_at,
        updated_at: started_at,
        ...overrides,
    };
}
```

**공통 설정**:

```typescript
// setup.ts
export function createTestContext() {
    const uow = new MemoryUnitOfWork();
    const services = createServices(uow);
    return { uow, ...services };
}
```

### Logseq API 모킹

```typescript
// tests/mocks/logseq.ts
export function createMockLogseq() {
    return {
        ready: vi.fn((cb: Function) => cb()),
        setMainUIInlineStyle: vi.fn(),
        showMainUI: vi.fn(),
        hideMainUI: vi.fn(),
        toggleMainUI: vi.fn(),
        App: {
            registerUIItem: vi.fn(),
            registerCommand: vi.fn(),
            registerCommandPalette: vi.fn(),
        },
        on: vi.fn(),
        provideModel: vi.fn(),
        settings: {},
        useSettingsSchema: vi.fn(),
    };
}

// tests/setup.ts
import { createMockLogseq } from './mocks/logseq';
globalThis.logseq = createMockLogseq() as any;
```

---

## 7. 테스트 작성 규칙

### 네이밍

- **테스트 설명은 한글로 작성** (프로젝트 컨벤션)
- `describe`는 대상 이름 (영문 또는 한글)
- `it`/`test`는 **한글 동작 설명**

### AAA 패턴

```typescript
it('진행중 작업이 있을 때 새 작업 시작 시 기존 작업이 일시정지되어야 함', async () => {
    // Arrange
    const storage = new MemoryStorageAdapter();
    const service = new TimerService(storage);
    const job_a = createTestJob({ title: 'A' });
    const job_b = createTestJob({ title: 'B' });

    // Act
    await service.start(job_a, category);
    await service.start(job_b, category, '전환');

    // Assert
    expect(service.getActiveJob()?.id).toBe(job_b.id);
});
```

### 파일 네이밍

| 유형      | 패턴                               | 예시                                |
| --------- | ---------------------------------- | ----------------------------------- |
| 단위      | `*.test.ts`                        | `timer_service.test.ts`             |
| 통합      | `*.integration.test.ts`            | `timer_service.integration.test.ts` |
| 컴포넌트  | `*.test.ts` (컴포넌트 디렉터리 내) | `Timer.test.ts`                     |
| E2E       | `*.spec.ts` (e2e/ 디렉터리)        | `timer.spec.ts`                     |
| Storybook | `*.stories.ts`                     | `Timer.stories.ts`                  |

---

## 8. 품질 게이트

| 항목                      | 기준                    |
| ------------------------- | ----------------------- |
| 테스트 통과율             | 100%                    |
| Line Coverage             | 80%+                    |
| Branch Coverage           | 75%+                    |
| 테스트 설명 한글          | 100%                    |
| Linter 오류 (테스트 포함) | 0개                     |
| E2E 실행                  | 사용자 명시 요청 시에만 |

---

## Test ID 기반 워크플로우

### ID 체계

`UC-{영역}-{번호}` (3자리 zero-padded)

| 영역 | 대상 |
|---|---|
| TIMER | TimerService |
| JOB | JobService |
| JCAT | JobCategoryService |
| CAT | CategoryService |
| HIST | HistoryService |
| ENTRY | TimeEntryService |
| DFIELD | DataFieldService |
| TMPL | TemplateService |
| STORE | StorageAdapter |
| MIGRATE | 스키마·Export 마이그레이션 |
| FSM | 상태 머신 전체 흐름 (통합) |
| TYPE | 타입 검증 |
| UI | Svelte 컴포넌트 |
| PLUGIN | Logseq 플러그인 |
| E2E | End-to-End 시나리오 |
| EDGE | 엣지 케이스 |
| REMIND | 알림·리마인더 |
| VRT | Visual Regression Testing |

### 워크플로우

1. 스펙 먼저: `__test_specs__/{level}/{domain}.md`에서 유즈케이스 ID 확인
2. ID 없으면: BDD 명세 먼저 작성 → ID 부여
3. 테스트 코드의 describe/it에 ID 포함: `it('UC-UI-024: ...', ...)`

### SSOT

- **상세 BDD 명세**: 각 패키지의 `__test_specs__/` 디렉토리
- **Phase별 인덱스**: [08-test-usecases.md](08-test-usecases.md)
