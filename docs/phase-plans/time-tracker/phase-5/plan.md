# Phase 5: 통계 & 정리

## 목표

통계 서비스(일별/주별/월별/카테고리별), eCount 연동 스켈레톤, Logseq 블록 동기화, 최종 문서화 및 릴리스 준비를 완료합니다.

---

## 선행 조건

- Phase 4 완료 — 잡 생성 워크플로우 + 템플릿 + 알림 동작

---

## 참조 설계 문서

| 문서                  | 섹션                   | 참조 내용                           |
| --------------------- | ---------------------- | ----------------------------------- |
| `02-architecture.md`  | §4.7 StatisticsService | 통계 집계 메서드 인터페이스         |
| `05-storage.md`       | §데이터 동기화 전략    | OPFS ↔ Logseq 블록 동기화 방향/시점 |
| `06-ui-ux.md`         | §타임존 UI 처리        | UTC 저장 + 로컬 표시 전략           |
| `01-requirements.md`  | FR-9                   | 통계/리포트                         |
| `01-requirements.md`  | FR-11                  | eCount 연동 (스켈레톤)              |
| `08-test-usecases.md` | §Phase 5 유즈케이스    | 통계 조회, 데이터 동기화            |
| `09-user-flows.md`    | UF-18 ~ UF-19          | 통계 대시보드, Logseq 동기화        |

---

## 서브 단계

### 5A: StatisticsService

| 파일                             | 역할           |
| -------------------------------- | -------------- |
| `services/statistics_service.ts` | 통계 집계 로직 |

**핵심 메서드** (02-architecture.md §4.7):

```typescript
interface IStatisticsService {
    getDailySummary(date: string): Promise<DailySummary>;
    getWeeklySummary(week_start: string): Promise<WeeklySummary>;
    getMonthlySummary(year: number, month: number): Promise<MonthlySummary>;
    getCategorySummary(category_id: string, period: Period): Promise<CategorySummary>;
    getJobSummary(job_id: string): Promise<JobSummary>;
}

interface DailySummary {
    date: string;
    total_duration_seconds: number;
    entry_count: number;
    by_category: CategoryDuration[];
    by_job: JobDuration[];
}

interface CategoryDuration {
    category_id: string;
    category_name: string;
    duration_seconds: number;
    percentage: number;
}

interface JobDuration {
    job_id: string;
    job_title: string;
    duration_seconds: number;
    percentage: number;
}

type Period = { from: string; to: string };
```

**집계 전략**:

- SQL 집계 쿼리 (GROUP BY + SUM) — SQLite Repository에서 처리
- 큰 기간 조회 시 서버 사이드 집계 (SQL)로 성능 확보
- 결과 캐싱: 일별 요약은 날짜 변경 시까지 캐시

### 5B: 통계 대시보드 UI

| 컴포넌트                  | 역할                              |
| ------------------------- | --------------------------------- |
| `StatsDashboard.svelte`   | 통계 대시보드 메인                |
| `DailyChart.svelte`       | 일별 시간 분포 차트               |
| `WeeklyChart.svelte`      | 주별 추이 차트                    |
| `CategoryPieChart.svelte` | 카테고리별 비율 파이 차트         |
| `PeriodSelector.svelte`   | 기간 선택 (일/주/월 + DatePicker) |

**차트 라이브러리**: Chart.js (경량, Canvas 기반)

### 5C: eCount 연동 스켈레톤

| 파일                                | 역할                                  |
| ----------------------------------- | ------------------------------------- |
| `adapters/ecount/ecount_adapter.ts` | IEcountAdapter 인터페이스 + stub 구현 |
| `services/ecount_sync_service.ts`   | TimeEntry → eCount 근태 데이터 매핑   |

**스켈레톤 범위**:

- 인터페이스만 정의 (실제 API 호출 없음)
- stub 구현: 성공 응답 반환
- 향후 실제 eCount API 연동 시 adapter만 교체

```typescript
interface IEcountAdapter {
    syncAttendance(entries: EcountAttendanceEntry[]): Promise<SyncResult>;
    getEmployeeId(): Promise<string>;
}

interface EcountAttendanceEntry {
    employee_id: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    category: string;
    description: string;
}
```

### 5D: Logseq 동기화

| 파일                                | 역할                                           |
| ----------------------------------- | ---------------------------------------------- |
| `services/logseq_sync_service.ts`   | OPFS ↔ Logseq 블록 동기화                      |
| `adapters/logseq/logseq_adapter.ts` | ILogseqAdapter 인터페이스 (logseq.Editor 래핑) |

**동기화 전략** (05-storage.md §데이터 동기화 전략):

- **방향**: OPFS → Logseq (단방향, OPFS가 SSOT)
- **시점**: Job 상태 변경 시 → 연결된 Logseq 페이지 properties 업데이트
- **내용**: status, total_time, last_updated 등 메타데이터

### 5E: 타임존 처리 정리

| 항목       | 설명                                     |
| ---------- | ---------------------------------------- |
| 저장       | UTC ISO8601 (`new Date().toISOString()`) |
| 표시       | `Intl.DateTimeFormat` 로컬 타임존        |
| 통계 집계  | 사용자 로컬 날짜 기준 (시작일/종료일)    |
| DatePicker | 로컬 시간 입력 → UTC 변환 저장           |

### 5F: 최종 문서화

| 문서                   | 내용                               |
| ---------------------- | ---------------------------------- |
| `README.md` 업데이트   | 설치, 사용법, 아키텍처 개요        |
| `CHANGELOG.md`         | v1.0.0 릴리스 노트                 |
| API 문서 (JSDoc/TSDoc) | public export 전체                 |
| 사용자 가이드          | Logseq 플러그인 설치 + 기본 사용법 |

### 5G: 릴리스 준비

| 항목                 | 설명                              |
| -------------------- | --------------------------------- |
| 빌드 최적화          | tree-shaking 확인, 번들 크기 분석 |
| 성능 프로파일링      | Lighthouse + 수동 측정            |
| 최종 E2E 테스트      | Playwright로 핵심 시나리오 검증   |
| package.json version | 1.0.0                             |

### 5H: 테스트

| 테스트                        | 범위                               |
| ----------------------------- | ---------------------------------- |
| StatisticsService 단위 테스트 | 일별/주별/월별/카테고리별 집계     |
| 통계 대시보드 컴포넌트 테스트 | 차트 렌더링, 기간 선택             |
| eCount stub 테스트            | 인터페이스 호환성                  |
| Logseq 동기화 통합 테스트     | 상태 변경 → 페이지 업데이트 (mock) |
| E2E 테스트                    | 전체 워크플로우 (Playwright)       |

---

## 완료 기준

- [ ] StatisticsService: 일별/주별/월별/카테고리별 집계
- [ ] 통계 대시보드 UI + 차트
- [ ] eCount 연동 스켈레톤 (인터페이스 + stub)
- [ ] Logseq 동기화 (OPFS → 페이지 properties)
- [ ] 타임존 처리 정리 (UTC 저장, 로컬 표시)
- [ ] README, CHANGELOG, API 문서, 사용자 가이드
- [ ] E2E 테스트 핵심 시나리오 통과
- [ ] 전체 테스트 통과 + 커버리지 80%+
- [ ] 빌드 최적화 + 번들 크기 확인

---

## 최종 산출물

- `@personal/time-tracker-core` v1.0.0 — 재사용 가능 코어 라이브러리
- `@personal/logseq-time-tracker` v1.0.0 — Logseq 플러그인 (Marketplace 배포 준비)
