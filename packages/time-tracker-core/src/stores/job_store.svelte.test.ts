import { describe, it, expect } from 'vitest';
import { createJobStore } from './job_store.svelte';
import type { Job } from '../types';

function make_job(id: string, status: Job['status']): Job {
    const now = new Date().toISOString();
    return {
        id,
        title: `작업 ${id}`,
        description: '',
        status,
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
    };
}

describe('createJobStore', () => {
    it('초기 상태: jobs 빈 배열, selected_job null', () => {
        const store = createJobStore();
        expect(store.jobs).toEqual([]);
        expect(store.selected_job_id).toBeNull();
        expect(store.selected_job).toBeNull();
    });

    it('setJobs: jobs 배열 설정', () => {
        const store = createJobStore();
        const list = [make_job('a', 'pending')];
        store.setJobs(list);
        expect(store.jobs).toHaveLength(1);
        expect(store.jobs[0]?.id).toBe('a');
    });

    it('selectJob: selected_job_id 설정 → selected_job derived 동작', () => {
        const store = createJobStore();
        store.setJobs([make_job('x', 'pending'), make_job('y', 'pending')]);
        store.selectJob('y');
        expect(store.selected_job_id).toBe('y');
        expect(store.selected_job?.id).toBe('y');
    });

    it('addJob: jobs 배열에 추가', () => {
        const store = createJobStore();
        const j = make_job('new', 'pending');
        store.addJob(j);
        expect(store.jobs).toContainEqual(j);
    });

    it('removeJob: jobs에서 제거 + 선택 해제', () => {
        const store = createJobStore();
        store.setJobs([make_job('a', 'pending')]);
        store.selectJob('a');
        store.removeJob('a');
        expect(store.jobs).toHaveLength(0);
        expect(store.selected_job_id).toBeNull();
    });

    it('updateJobInList: 기존 Job 업데이트', () => {
        const store = createJobStore();
        store.setJobs([make_job('a', 'pending')]);
        const updated = { ...make_job('a', 'pending'), title: '변경됨' };
        store.updateJobInList(updated);
        expect(store.jobs[0]?.title).toBe('변경됨');
    });

    it('active_job derived: status === in_progress인 Job 반환', () => {
        const store = createJobStore();
        store.setJobs([make_job('p', 'pending'), make_job('r', 'in_progress')]);
        expect(store.active_job?.id).toBe('r');
    });

    it('pending_jobs derived: status === pending인 Job 배열', () => {
        const store = createJobStore();
        store.setJobs([make_job('1', 'pending'), make_job('2', 'in_progress'), make_job('3', 'pending')]);
        expect(store.pending_jobs.map((j) => j.id)).toEqual(['1', '3']);
    });

    it('paused_jobs derived: status === paused인 Job 배열', () => {
        const store = createJobStore();
        store.setJobs([make_job('1', 'paused'), make_job('2', 'completed'), make_job('3', 'paused')]);
        expect(store.paused_jobs.map((j) => j.id)).toEqual(['1', '3']);
    });
});
