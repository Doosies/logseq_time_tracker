import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import OverlapResolutionModal from '../../components/OverlapResolutionModal/OverlapResolutionModal.svelte';
import type { TimeEntry } from '../../types/time_entry';

const ts = '2025-01-01T00:00:00.000Z';

function make_entry(partial: Partial<TimeEntry> & Pick<TimeEntry, 'id' | 'started_at' | 'ended_at'>): TimeEntry {
    return {
        job_id: 'job-1',
        category_id: 'cat-1',
        duration_seconds: 3600,
        note: '',
        is_manual: true,
        created_at: ts,
        updated_at: ts,
        ...partial,
    };
}

describe('OverlapResolutionModal', () => {
    afterEach(() => {
        cleanup();
    });

    it('UC-UI-015: 현재 입력 우선 클릭 시 onResolve(new_first) 호출됨', async () => {
        const user = userEvent.setup();
        const on_resolve = vi.fn();
        const { getByRole } = render(OverlapResolutionModal, {
            props: {
                new_entry: {
                    started_at: '2025-01-15T10:00:00.000Z',
                    ended_at: '2025-01-15T12:00:00.000Z',
                    job_id: 'job-1',
                },
                overlapping: [
                    make_entry({
                        id: 'ex-1',
                        started_at: '2025-01-15T11:00:00.000Z',
                        ended_at: '2025-01-15T13:00:00.000Z',
                    }),
                ],
                onResolve: on_resolve,
                onCancel: vi.fn(),
            },
        });

        const new_first_btn = getByRole('button', { name: '현재 입력 우선' });
        expect(new_first_btn.className).toMatch(/button_primary/);
        await user.click(new_first_btn);
        expect(on_resolve).toHaveBeenCalledWith('new_first');
    });

    it('UC-UI-016: 기존 입력 우선 클릭 시 onResolve(existing_first) 호출됨', async () => {
        const user = userEvent.setup();
        const on_resolve = vi.fn();
        const { getByRole } = render(OverlapResolutionModal, {
            props: {
                new_entry: {
                    started_at: '2025-01-15T10:00:00.000Z',
                    ended_at: '2025-01-15T12:00:00.000Z',
                    job_id: 'job-1',
                },
                overlapping: [
                    make_entry({
                        id: 'ex-1',
                        started_at: '2025-01-15T11:00:00.000Z',
                        ended_at: '2025-01-15T13:00:00.000Z',
                    }),
                ],
                onResolve: on_resolve,
                onCancel: vi.fn(),
            },
        });

        const existing_first_btn = getByRole('button', { name: '기존 입력 우선' });
        expect(existing_first_btn.className).toMatch(/button_secondary/);
        await user.click(existing_first_btn);
        expect(on_resolve).toHaveBeenCalledWith('existing_first');
    });

    it('UC-UI-017: 새 구간이 기존을 완전 포함할 때 겹침 세그먼트가 보이고 현재 입력 우선이 동작함', async () => {
        const user = userEvent.setup();
        const on_resolve = vi.fn();
        const { container, getByRole } = render(OverlapResolutionModal, {
            props: {
                new_entry: {
                    started_at: '2025-01-15T10:00:00.000Z',
                    ended_at: '2025-01-15T14:00:00.000Z',
                    job_id: 'job-1',
                },
                overlapping: [
                    make_entry({
                        id: 'ex-wrap',
                        started_at: '2025-01-15T11:00:00.000Z',
                        ended_at: '2025-01-15T13:00:00.000Z',
                    }),
                ],
                onResolve: on_resolve,
                onCancel: vi.fn(),
            },
        });

        const track = getByRole('img', { name: '타임라인' });
        expect(track).toBeTruthy();
        const overlap_segments = container.querySelectorAll('[class*="segment_overlap"]');
        expect(overlap_segments.length).toBeGreaterThan(0);
        expect(container.textContent).toMatch(/겹침|기존|새 구간/u);

        await user.click(getByRole('button', { name: '현재 입력 우선' }));
        expect(on_resolve).toHaveBeenCalledWith('new_first');
    });

    it('UC-UI-018: 기존이 새 구간을 완전 포함할 때 겹침 세그먼트가 보이고 기존 입력 우선이 동작함', async () => {
        const user = userEvent.setup();
        const on_resolve = vi.fn();
        const { container, getByRole } = render(OverlapResolutionModal, {
            props: {
                new_entry: {
                    started_at: '2025-01-15T11:00:00.000Z',
                    ended_at: '2025-01-15T13:00:00.000Z',
                    job_id: 'job-1',
                },
                overlapping: [
                    make_entry({
                        id: 'ex-outer',
                        started_at: '2025-01-15T09:00:00.000Z',
                        ended_at: '2025-01-15T15:00:00.000Z',
                    }),
                ],
                onResolve: on_resolve,
                onCancel: vi.fn(),
            },
        });

        const overlap_segments = container.querySelectorAll('[class*="segment_overlap"]');
        expect(overlap_segments.length).toBeGreaterThan(0);

        await user.click(getByRole('button', { name: '기존 입력 우선' }));
        expect(on_resolve).toHaveBeenCalledWith('existing_first');
    });
});
