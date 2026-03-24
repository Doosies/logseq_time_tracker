import { SvelteDate } from 'svelte/reactivity';
import type { Job, Category } from '../types';

interface TimerState {
    active_job: Job | null;
    active_category: Category | null;
    current_segment_start: string | null;
    accumulated_ms: number;
    is_paused: boolean;
}

export function createTimerStore() {
    let state = $state<TimerState>({
        active_job: null,
        active_category: null,
        current_segment_start: null,
        accumulated_ms: 0,
        is_paused: false,
    });

    const is_running = $derived(state.active_job !== null && !state.is_paused);

    function startTimer(job: Job, category: Category): void {
        state = {
            active_job: job,
            active_category: category,
            current_segment_start: new SvelteDate().toISOString(),
            accumulated_ms: 0,
            is_paused: false,
        };
    }

    function pauseTimer(): void {
        if (!state.current_segment_start) return;
        const now = Date.now();
        const segment_ms = now - new SvelteDate(state.current_segment_start).getTime();
        state = {
            ...state,
            accumulated_ms: state.accumulated_ms + segment_ms,
            current_segment_start: null,
            is_paused: true,
        };
    }

    function resumeTimer(): void {
        state = {
            ...state,
            current_segment_start: new SvelteDate().toISOString(),
            is_paused: false,
        };
    }

    function stopTimer(): void {
        state = {
            active_job: null,
            active_category: null,
            current_segment_start: null,
            accumulated_ms: 0,
            is_paused: false,
        };
    }

    function cancelTimer(): void {
        stopTimer();
    }

    function restore(
        job: Job,
        category: Category,
        started_at: string,
        is_paused: boolean,
        accumulated_ms: number,
        _paused_at?: string,
    ): void {
        state = {
            active_job: job,
            active_category: category,
            current_segment_start: is_paused ? null : started_at,
            accumulated_ms,
            is_paused,
        };
    }

    return {
        get state() {
            return state;
        },
        get active_job_id(): string | null {
            return state.active_job?.id ?? null;
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

export type TimerStore = ReturnType<typeof createTimerStore>;
