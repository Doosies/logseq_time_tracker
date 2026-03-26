# 테스트 유즈케이스 인덱스

**작성일**: 2026-03-15
**버전**: 2.0
**역할**: Phase별 유즈케이스 인덱스. 상세 BDD 명세는 각 패키지의 `__test_specs__/`를 참조합니다.

---

## ID 체계

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
| STAT | StatisticsService |
| STORE | StorageAdapter |
| MIGRATE | 스키마·Export 마이그레이션 |
| EXPORT |보내기/가져오기 |
| FSM | 상태 머신 전체 흐름 (통합) |
| TYPE | 타입 검증 |
| UI | Svelte 컴포넌트 |
| TOAST | 토스트 시스템 |
| PLUGIN | Logseq 플러그인 |
| E2E | End-to-End 시나리오 |
| EDGE | 엣지 케이스 |
| REMIND | 알림·리마인더 |
| PERF | 성능 테스트 |
| A11Y | 접근성 테스트 |
| CANCEL | 취소 동작 |
| STOP | 정지 동작 |
| CATEGORY-CYCLE | 카테고리 순환 참조 |
| VRT | Visual Regression Testing |
| SQL-{SUB} | SQLite 어댑터/레포지토리 (SUB: ADPT, CAT, HIST, JCAT, JOB, SET, TMPL, TE, UOW, DF) |
| MEM | Memory 레포지토리 구현 |
| ERR | 에러 클래스 |
| UTIL | 유틸리티 함수 (ID 생성, sanitize, backoff) |
| SCHEMA | Export 스키마 검증 |

---

## Phase별 유즈케이스 요약

| Phase | 단위 | 통합 | 컴포넌트 | E2E | VRT |
|---|---|---|---|---|---|
| **1** | UC-TIMER-001~010, UC-JOB-001~002, UC-CAT-001~004, UC-STORE-001~025, UC-TYPE-001~004, UC-PLUGIN-001~002, UC-EDGE-001, UC-EDGE-003, UC-EDGE-007, UC-CANCEL-001~003, UC-STOP-001~002, UC-CATEGORY-CYCLE-001, UC-SQL-*-001~, UC-MEM-001~008, UC-ERR-001~007, UC-UTIL-001~008, UC-SCHEMA-001~008, UC-EXPORT-004~007 | UC-FSM-001~003, UC-FSM-005, UC-PLUGIN-006 | UC-UI-001~003, UC-UI-025~033, UC-TOAST-001~003, UC-A11Y-001~004 | - | - |
| **2** | UC-JOB-003~010, UC-JCAT-001~003, UC-HIST-001~004, UC-STORE-026~033, UC-MIGRATE-001~002, UC-PLUGIN-003, UC-EDGE-002, UC-EDGE-004~006, UC-EDGE-008 | UC-FSM-004, UC-FSM-006 | UC-UI-004~008 | UC-E2E-001~002, UC-PERF-001~002 | - |
| **3** | UC-ENTRY-001~004, UC-DFIELD-001~003 | UC-PERF-004 | UC-UI-009~024, UC-PERF-003 | UC-E2E-003, UC-E2E-006~010, UC-A11Y-005 | UC-VRT-001~003 |
| **4** | UC-TMPL-001~004, UC-PLUGIN-004~005 | UC-REMIND-001~003 | - | UC-E2E-004~005 | - |
| **5** | UC-STAT-001~004, UC-EXPORT-001, UC-EXPORT-003 | UC-EXPORT-002 | - | - | - |

---

## 상세 BDD 명세 위치

### @personal/time-tracker-core

| 테스트 레벨 | 경로 |
|---|---|
| 단위 | [`__test_specs__/unit/`](../../packages/time-tracker-core/__test_specs__/unit/) |
| 통합 | [`__test_specs__/integration/`](../../packages/time-tracker-core/__test_specs__/integration/) |
| 컴포넌트 | [`__test_specs__/component/`](../../packages/time-tracker-core/__test_specs__/component/) |
| 엣지 케이스 | [`__test_specs__/edge-cases/`](../../packages/time-tracker-core/__test_specs__/edge-cases/) |

### @personal/logseq-time-tracker

| 테스트 레벨 | 경로 |
|---|---|
| 단위 | [`__test_specs__/unit/`](../../packages/logseq-time-tracker/__test_specs__/unit/) |
| E2E | [`__test_specs__/e2e/`](../../packages/logseq-time-tracker/__test_specs__/e2e/) |
| VRT | [`__test_specs__/vrt/`](../../packages/logseq-time-tracker/__test_specs__/vrt/) |
