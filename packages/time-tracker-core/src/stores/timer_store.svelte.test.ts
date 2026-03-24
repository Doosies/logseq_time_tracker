import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createTimerStore } from './timer_store.svelte';
import type { Category, Job } from '../types';

function make_job(overrides: Partial<Job> = {}): Job {
    const now = new Date().toISOString();
    return {
        id: 'job-1',
        title: '작업',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

function make_category(overrides: Partial<Category> = {}): Category {
    const now = new Date().toISOString();
    return {
        id: 'cat-1',
        name: '개발',
        parent_id: null,
        is_active: true,
        sort_order: 1,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

describe('createTimerStore', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T12:00:00.000Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('초기 상태: active_job null, is_running false', () => {
        const store = createTimerStore();
        expect(store.state.active_job).toBeNull();
        expect(store.state.is_paused).toBe(false);
        expect(store.is_running).toBe(false);
    });

    it('startTimer: active_job 설정, is_running true, accumulated_ms 0', () => {
        const store = createTimerStore();
        const job = make_job();
        const category = make_category();
        store.startTimer(job, category);
        expect(store.state.active_job?.id).toBe(job.id);
        expect(store.state.active_category?.id).toBe(category.id);
        expect(store.state.accumulated_ms).toBe(0);
        expect(store.state.is_paused).toBe(false);
        expect(store.state.current_segment_start).not.toBeNull();
        expect(store.is_running).toBe(true);
    });

    it('pauseTimer: is_paused true, accumulated_ms에 경과 시간 누적, current_segment_start null', () => {
        const store = createTimerStore();
        const job = make_job({ status: 'in_progress' });
        const category = make_category();
        const started_at = '2025-06-01T12:00:00.000Z';
        vi.setSystemTime(new Date(started_at));
        // startTimer의 SvelteDate().toISOString()은 fake time과 어긋날 수 있어, ISO 고정 문자열로 세그먼트 시작을 둠
        store.restore(job, category, started_at, false, 0);
        vi.setSystemTime(new Date('2025-06-01T12:00:05.000Z'));
        store.pauseTimer();
        expect(store.state.is_paused).toBe(true);
        expect(store.state.current_segment_start).toBeNull();
        expect(store.state.accumulated_ms).toBeGreaterThanOrEqual(4000);
        expect(store.is_running).toBe(false);
    });

    it('resumeTimer: is_paused false, current_segment_start 설정', () => {
        const store = createTimerStore();
        store.startTimer(make_job(), make_category());
        vi.setSystemTime(new Date('2025-06-01T12:00:03.000Z'));
        store.pauseTimer();
        vi.setSystemTime(new Date('2025-06-01T12:01:00.000Z'));
        store.resumeTimer();
        expect(store.state.is_paused).toBe(false);
        expect(store.state.current_segment_start).not.toBeNull();
        expect(store.is_running).toBe(true);
    });

    it('stopTimer: 모든 상태 초기화', () => {
        const store = createTimerStore();
        store.startTimer(make_job(), make_category());
        store.stopTimer();
        expect(store.state.active_job).toBeNull();
        expect(store.state.active_category).toBeNull();
        expect(store.state.current_segment_start).toBeNull();
        expect(store.state.accumulated_ms).toBe(0);
        expect(store.state.is_paused).toBe(false);
        expect(store.is_running).toBe(false);
    });

    it('cancelTimer: 모든 상태 초기화', () => {
        const store = createTimerStore();
        store.startTimer(make_job(), make_category());
        store.cancelTimer();
        expect(store.state.active_job).toBeNull();
        expect(store.is_running).toBe(false);
    });

    it('restore: 일시정지 상태 복구 시 current_segment_start null', () => {
        const store = createTimerStore();
        const job = make_job({ status: 'paused' });
        const started_at = '2025-06-01T10:00:00.000Z';
        store.restore(job, make_category(), started_at, true, 12_000);
        expect(store.state.is_paused).toBe(true);
        expect(store.state.current_segment_start).toBeNull();
        expect(store.state.accumulated_ms).toBe(12_000);
        expect(store.is_running).toBe(false);
    });

    it('restore: 실행 중 복구 시 current_segment_start 설정', () => {
        const store = createTimerStore();
        const job = make_job({ status: 'in_progress' });
        const started_at = '2025-06-01T11:00:00.000Z';
        store.restore(job, make_category(), started_at, false, 1000);
        expect(store.state.is_paused).toBe(false);
        expect(store.state.current_segment_start).toBe(started_at);
        expect(store.is_running).toBe(true);
    });

    it('is_running derived: active_job 있고 is_paused false일 때 true', () => {
        const store = createTimerStore();
        store.startTimer(make_job(), make_category());
        expect(store.is_running).toBe(true);
        vi.setSystemTime(new Date('2025-06-01T12:00:02.000Z'));
        store.pauseTimer();
        expect(store.is_running).toBe(false);
    });
});
