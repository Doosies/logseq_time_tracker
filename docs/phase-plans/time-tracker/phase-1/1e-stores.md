# Phase 1E: 스토어

## 목표

Svelte 5 Runes 기반 반응형 스토어 3개 (timer_store, job_store, toast_store) 를 구현합니다. 서비스 레이어와 UI 컴포넌트 사이의 반응형 다리 역할입니다.

---

## 선행 조건

- Phase 1D 완료 — 4개 서비스 구현됨
- `time-tracker-core`에 Svelte 5가 peerDependency로 설정됨

---

## 참조 설계 문서

| 문서                     | 섹션               | 참조 내용                                                          |
| ------------------------ | ------------------ | ------------------------------------------------------------------ |
| `04-state-management.md` | §Svelte 5 Runes    | $state, $derived 패턴, createXxxStore() 팩토리                     |
| `04-state-management.md` | §timer_store       | 이벤트-타임스탬프 기반 구조, accumulated_ms, current_segment_start |
| `04-state-management.md` | §job_store         | Job[], 선택된 Job, 선택된 Category                                 |
| `04-state-management.md` | §toast_store       | FIFO 큐, 최대 3개, 중복 방지, 자동/수동 해제                       |
| `04-state-management.md` | §앱 재시작 시 복구 | ActiveTimerState → timer_store 복구                                |
| `06-ui-ux.md`            | §에러 및 알림 UI   | toast 유형 (success/error/warning/info)                            |

---

## 생성 파일 목록

모든 파일은 `packages/time-tracker-core/src/stores/` 하위입니다.

| 파일             | 역할                               |
| ---------------- | ---------------------------------- |
| `timer_store.ts` | 이벤트 타임스탬프 기반 타이머 상태 |
| `job_store.ts`   | Job 목록 + 선택 상태               |
| `toast_store.ts` | 토스트 알림 큐                     |
| `index.ts`       | barrel re-export                   |

---

## 구현 상세

### timer_store

```typescript
interface TimerState {
    active_job: Job | null;
    active_category: Category | null;
    current_segment_start: string | null; // ISO8601 UTC
    accumulated_ms: number;
    is_paused: boolean;
}

function createTimerStore() {
    let state = $state<TimerState>({
        active_job: null,
        active_category: null,
        current_segment_start: null,
        accumulated_ms: 0,
        is_paused: false,
    });

    const is_running = $derived(state.active_job !== null && !state.is_paused);

    function startTimer(job: Job, category: Category) {
        /* ... */
    }
    function pauseTimer() {
        /* ... */
    }
    function resumeTimer() {
        /* ... */
    }
    function stopTimer() {
        /* ... */
    }
    function cancelTimer() {
        /* ... */
    }
    function restore(saved: ActiveTimerState) {
        /* ... */
    }

    return {
        get state() {
            return state;
        },
        get is_running() {
            return is_running;
        },
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        cancelTimer,
        restore,
    };
}
```

**이벤트-타임스탬프 모델**:

- setInterval/tick 없음 (store 레이어)
- `current_segment_start` + `accumulated_ms`로 UI가 `getElapsedMs()` 호출하여 실시간 표시
- UI 레이어(TimerDisplay)에서 `requestAnimationFrame`으로 자체 tick

**restore()**:

- 앱 재시작 시 ActiveTimerState → timer_store 복구
- referential integrity 검증: job_id, category_id가 실제로 존재하는지 확인
- 존재하지 않으면 ActiveTimerState 삭제하고 경고 로그

### job_store

```typescript
interface JobStoreState {
    jobs: Job[];
    selected_job_id: string | null;
    selected_category_id: string | null;
    is_loading: boolean;
}

function createJobStore() {
    let state = $state<JobStoreState>({
        jobs: [],
        selected_job_id: null,
        selected_category_id: null,
        is_loading: false,
    });

    const selected_job = $derived(state.jobs.find((j) => j.id === state.selected_job_id) ?? null);

    const active_job = $derived(state.jobs.find((j) => j.status === 'in_progress') ?? null);

    function setJobs(jobs: Job[]) {
        state.jobs = jobs;
    }
    function selectJob(job_id: string) {
        state.selected_job_id = job_id;
    }
    function selectCategory(category_id: string) {
        state.selected_category_id = category_id;
    }
    function refreshJobs(fn: () => Promise<Job[]>) {
        /* is_loading toggle + setJobs */
    }

    return {
        get state() {
            return state;
        },
        get selected_job() {
            return selected_job;
        },
        get active_job() {
            return active_job;
        },
        setJobs,
        selectJob,
        selectCategory,
        refreshJobs,
    };
}
```

### toast_store

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    auto_dismiss_ms?: number;
}

function createToastStore() {
    let toasts = $state<Toast[]>([]);

    function addToast(toast: Omit<Toast, 'id'>) {
        // 중복 방지: 동일 message + type이면 무시
        if (toasts.some((t) => t.message === toast.message && t.type === toast.type)) return;
        // 최대 3개 초과 시 가장 오래된 것 제거 (FIFO)
        if (toasts.length >= TOAST_MAX_COUNT) {
            toasts = toasts.slice(1);
        }
        const new_toast: Toast = { ...toast, id: generateId() };
        toasts = [...toasts, new_toast];
        // auto_dismiss 설정
        if (new_toast.auto_dismiss_ms) {
            setTimeout(() => removeToast(new_toast.id), new_toast.auto_dismiss_ms);
        }
    }

    function removeToast(id: string) {
        toasts = toasts.filter((t) => t.id !== id);
    }

    return {
        get toasts() {
            return toasts;
        },
        addToast,
        removeToast,
    };
}
```

---

## 완료 기준

- [ ] timer_store: 이벤트-타임스탬프 모델 (setInterval 없음)
- [ ] timer_store: restore() + referential integrity 검증
- [ ] job_store: $derived로 selected_job / active_job 자동 계산
- [ ] toast_store: FIFO, 최대 3개, 중복 방지, auto_dismiss
- [ ] 모든 스토어가 `createXxxStore()` 팩토리 패턴
- [ ] `pnpm type-check` 성공

---

## 다음 단계

→ Phase 1F: UI 컴포넌트 (`1f-ui-components.md`)
