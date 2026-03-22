# Phase 1B: 코어 타입 & 에러

## 목표

도메인 타입, FSM 전환 테이블, 에러 계층, 상수, 유틸리티 함수를 정의합니다. 이 단계의 산출물은 이후 모든 Phase의 기반입니다.

---

## 선행 조건

- Phase 1A 완료 — `time-tracker-core` 패키지 빌드 가능

---

## 참조 설계 문서

| 문서                     | 섹션                    | 참조 내용                                                                                                         |
| ------------------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `03-data-model.md`       | §7 TypeScript 타입 정의 | Job, TimeEntry, Category, JobHistory, ExternalRef, JobCategory, JobTemplate, DataType, EntityType, DataField 전체 |
| `03-data-model.md`       | §7 ParsedCustomFields   | custom_fields JSON 파싱 타입 + 유틸 함수                                                                          |
| `04-state-management.md` | §상태 머신 (FSM)        | StatusKind, 전환 규칙 테이블, 전환 다이어그램                                                                     |
| `02-architecture.md`     | §11 에러 타입 체계      | TimeTrackerError 계층 (6개 에러 클래스)                                                                           |
| `02-architecture.md`     | §4.11 입력값 새니타이징 | sanitizeText 유틸, 필드별 최대 길이                                                                               |
| `04-state-management.md` | §UI 문자열 상수         | STRINGS 상수 객체 (timer, job, reason_modal, error)                                                               |
| `05-storage.md`          | §진행 중 타이머 영속화  | ActiveTimerState 인터페이스                                                                                       |
| `04-state-management.md` | §앱 초기화 순서         | AppInitState 타입                                                                                                 |

---

## 생성 파일 목록

모든 파일은 `packages/time-tracker-core/src/` 하위입니다.

### types/

| 파일                    | 역할                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `types/job_status.ts`   | `StatusKind` 타입, `VALID_TRANSITIONS` 맵, `isValidTransition()`  |
| `types/job.ts`          | `Job`, `ParsedCustomFields`, `parseCustomFields()`                |
| `types/category.ts`     | `Category`                                                        |
| `types/time_entry.ts`   | `TimeEntry`, `TimeEntryFilter`                                    |
| `types/history.ts`      | `JobHistory`, `HistoryFilter`                                     |
| `types/external_ref.ts` | `ExternalRef`                                                     |
| `types/job_category.ts` | `JobCategory`                                                     |
| `types/template.ts`     | `JobTemplate`, `PlaceholderDef`                                   |
| `types/meta.ts`         | `DataTypeKey`, `DataType`, `EntityType`, `DataField`              |
| `types/settings.ts`     | `ActiveTimerState`, `SettingsMap`, `AppInitState`, `StorageState` |
| `types/index.ts`        | barrel re-export                                                  |

### errors/

| 파일              | 역할                      |
| ----------------- | ------------------------- |
| `errors/base.ts`  | 6개 에러 클래스 전체 정의 |
| `errors/index.ts` | barrel re-export          |

### constants/

| 파일                   | 역할                                     |
| ---------------------- | ---------------------------------------- |
| `constants/strings.ts` | UI 문자열 상수 (`STRINGS` 객체)          |
| `constants/config.ts`  | 앱 설정 상수 (깊이 제한, 토스트 개수 등) |
| `constants/index.ts`   | barrel re-export                         |

### utils/

| 파일                | 역할                                                          |
| ------------------- | ------------------------------------------------------------- |
| `utils/sanitize.ts` | `sanitizeText()` — HTML 제거 + trim + 최대 길이 검증          |
| `utils/time.ts`     | `formatLocalDateTime()`, `formatDuration()`, `getElapsedMs()` |
| `utils/id.ts`       | `generateId()` — `crypto.randomUUID()` 래퍼                   |
| `utils/index.ts`    | barrel re-export                                              |

---

## 구현 상세

### types/job_status.ts 핵심

```typescript
export type StatusKind = 'pending' | 'in_progress' | 'paused' | 'cancelled' | 'completed';

export const VALID_TRANSITIONS: Record<StatusKind, readonly StatusKind[]> = {
    pending: ['in_progress', 'cancelled', 'completed'],
    in_progress: ['paused', 'completed', 'cancelled'],
    paused: ['in_progress', 'completed', 'cancelled'],
    completed: ['pending'],
    cancelled: ['pending'],
} as const;

export function isValidTransition(from: StatusKind, to: StatusKind): boolean {
    return VALID_TRANSITIONS[from].includes(to);
}
```

### types/settings.ts 핵심

```typescript
export interface ActiveTimerState {
    version: number;
    job_id: string;
    category_id: string;
    started_at: string;
    is_paused: boolean;
    paused_at?: string;
    accumulated_ms: number;
}

export type SettingsMap = {
    active_timer: ActiveTimerState;
    last_selected_category: string;
};

export type AppInitState = 'loading' | 'ready' | 'error';

export interface StorageState {
    mode: 'sqlite' | 'memory_fallback';
    fallback_reason?: string;
    fallback_since?: string;
}
```

### errors/base.ts 핵심

```typescript
export class TimeTrackerError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
        this.name = this.constructor.name;
    }
}

export class ValidationError extends TimeTrackerError {
    /* field?: string */
}
export class StateTransitionError extends TimeTrackerError {
    /* from_status, to_status */
}
export class StorageError extends TimeTrackerError {
    /* operation: string */
}
export class TimerError extends TimeTrackerError {
    /* code: TIMER_ERROR */
}
export class ReferenceIntegrityError extends TimeTrackerError {
    /* entity, id */
}
```

> 전체 코드는 `02-architecture.md` §11에 정의되어 있습니다.

### constants/config.ts 핵심

```typescript
export const CATEGORY_MAX_DEPTH = 10;
export const TOAST_MAX_COUNT = 3;
export const TIMER_BACKUP_INTERVAL_MS = 30_000;
export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2_000;
export const MAX_REASON_LENGTH = 500;
export const MAX_NOTE_LENGTH = 1_000;
export const MAX_CATEGORY_NAME_LENGTH = 100;
```

### utils/sanitize.ts 핵심

```typescript
export function sanitizeText(input: string, max_length: number): string {
    const cleaned = input.replace(/<[^>]*>/g, ' ').trim();
    if (cleaned.length > max_length) {
        throw new ValidationError(`최대 ${max_length}자를 초과했습니다`, 'length');
    }
    return cleaned;
}
```

### utils/time.ts 핵심

```typescript
export function getElapsedMs(accumulated_ms: number, current_segment_start: string | null, is_paused: boolean): number {
    if (!current_segment_start || is_paused) return accumulated_ms;
    return accumulated_ms + (Date.now() - new Date(current_segment_start).getTime());
}

export function formatDuration(total_seconds: number): string {
    const h = Math.floor(total_seconds / 3600);
    const m = Math.floor((total_seconds % 3600) / 60);
    const s = total_seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatLocalDateTime(utc_iso: string): string {
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(utc_iso));
}
```

---

## 완료 기준

- [ ] 모든 타입 파일 타입 에러 0개
- [ ] VALID_TRANSITIONS가 설계 문서 FSM과 일치
- [ ] 에러 클래스 6개 모두 정의
- [ ] sanitizeText가 필드별 최대 길이와 일치
- [ ] `pnpm type-check` 성공
- [ ] `src/index.ts`에서 types, errors, constants, utils 모두 re-export

---

## 다음 단계

→ Phase 1C: 저장소 레이어 (`1c-storage.md`)
