import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ManualEntryForm from '../../components/ManualEntryForm/ManualEntryForm.svelte';
import type { AppContext } from '../../app/context';
import type { Job } from '../../types/job';
import type { Category } from '../../types/category';
import type { TimeEntry } from '../../types/time_entry';

const ts = '2025-01-01T00:00:00.000Z';

function make_job(partial: Partial<Job> & Pick<Job, 'id' | 'title'>): Job {
    return {
        description: '',
        status: 'in_progress',
        custom_fields: '{}',
        created_at: ts,
        updated_at: ts,
        ...partial,
    };
}

function make_category(partial: Partial<Category> & Pick<Category, 'id' | 'name' | 'parent_id'>): Category {
    return {
        sort_order: 0,
        is_active: true,
        created_at: ts,
        updated_at: ts,
        ...partial,
    };
}

describe('ManualEntryForm', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-UI-013: 중복이 없으면 저장 시 createManualEntry와 onSubmit이 호출됨', async () => {
        const user = userEvent.setup();
        const detect_overlaps = vi.fn().mockResolvedValue([] as TimeEntry[]);
        const created: TimeEntry = {
            id: 'entry-new',
            job_id: 'job-1',
            category_id: 'cat-1',
            started_at: '2025-06-01T09:00:00.000Z',
            ended_at: '2025-06-01T10:00:00.000Z',
            duration_seconds: 3600,
            note: '',
            is_manual: true,
            created_at: ts,
            updated_at: ts,
        };
        const create_manual_entry = vi.fn().mockResolvedValue(created);
        const add_toast = vi.fn();
        const mock_context = {
            services: {
                time_entry_service: {
                    detectOverlaps: detect_overlaps,
                    createManualEntry: create_manual_entry,
                    resolveOverlap: vi.fn().mockResolvedValue([]),
                },
            },
            stores: {
                toast_store: { addToast: add_toast },
            },
        } as unknown as AppContext;

        const jobs: Job[] = [make_job({ id: 'job-1', title: '폼 테스트 작업' })];
        const categories: Category[] = [make_category({ id: 'cat-1', name: '분류 A', parent_id: null })];
        const on_submit = vi.fn();

        const { getByRole, getAllByRole } = render(ManualEntryForm, {
            props: {
                context: mock_context,
                jobs,
                categories,
                onSubmit: on_submit,
                onCancel: vi.fn(),
            },
        });

        const combos = getAllByRole('combobox');
        await user.click(combos[0]!);
        await user.click(getByRole('option', { name: /폼 테스트 작업/ }));

        await user.click(combos[1]!);
        await user.click(getByRole('option', { name: '분류 A' }));

        await user.click(getByRole('button', { name: '저장' }));

        await waitFor(() => {
            expect(create_manual_entry).toHaveBeenCalled();
        });
        expect(detect_overlaps).toHaveBeenCalled();
        expect(on_submit).toHaveBeenCalledWith(created);
    });

    it('UC-UI-014: 겹침이 있으면 OverlapResolutionModal dialog가 표시됨', async () => {
        const user = userEvent.setup();
        const overlapping: TimeEntry = {
            id: 'ov-1',
            job_id: 'job-1',
            category_id: 'cat-1',
            started_at: '2025-06-02T08:00:00.000Z',
            ended_at: '2025-06-02T18:00:00.000Z',
            duration_seconds: 36000,
            note: '',
            is_manual: true,
            created_at: ts,
            updated_at: ts,
        };
        const detect_overlaps = vi.fn().mockResolvedValue([overlapping]);
        const mock_context = {
            services: {
                time_entry_service: {
                    detectOverlaps: detect_overlaps,
                    createManualEntry: vi.fn(),
                    resolveOverlap: vi.fn().mockResolvedValue([]),
                },
            },
            stores: {
                toast_store: { addToast: vi.fn() },
            },
        } as unknown as AppContext;

        const jobs: Job[] = [make_job({ id: 'job-1', title: '겹침 테스트 작업' })];
        const categories: Category[] = [make_category({ id: 'cat-1', name: '분류 B', parent_id: null })];

        const { getByRole, getAllByRole } = render(ManualEntryForm, {
            props: {
                context: mock_context,
                jobs,
                categories,
                onSubmit: vi.fn(),
                onCancel: vi.fn(),
            },
        });

        const combos = getAllByRole('combobox');
        await user.click(combos[0]!);
        await user.click(getByRole('option', { name: /겹침 테스트 작업/ }));

        await user.click(combos[1]!);
        await user.click(getByRole('option', { name: '분류 B' }));

        await user.click(getByRole('button', { name: '저장' }));

        await waitFor(() => {
            expect(getByRole('dialog', { name: '시간 겹침' })).toHaveAttribute('aria-modal', 'true');
        });
    });

    it('UC-UI-007: 빈 필드 제출 거부 — 작업/카테고리 미선택 시 저장 버튼 비활성화', () => {
        const mock_context = {
            services: {
                time_entry_service: {
                    detectOverlaps: vi.fn().mockResolvedValue([]),
                    createManualEntry: vi.fn(),
                    resolveOverlap: vi.fn().mockResolvedValue([]),
                },
            },
            stores: {
                toast_store: { addToast: vi.fn() },
            },
        } as unknown as AppContext;

        const { getByRole } = render(ManualEntryForm, {
            props: {
                context: mock_context,
                jobs: [make_job({ id: 'j-1', title: 'Job' })],
                categories: [make_category({ id: 'c-1', name: 'Cat', parent_id: null })],
                onSubmit: vi.fn(),
                onCancel: vi.fn(),
            },
        });

        expect(getByRole('button', { name: '저장' })).toBeDisabled();
    });

    it('UC-UI-008: 정상 제출 — 작업/카테고리 선택 후 저장 시 createManualEntry 호출', async () => {
        const user = userEvent.setup();
        const created: TimeEntry = {
            id: 'e-008',
            job_id: 'j-1',
            category_id: 'c-1',
            started_at: '2025-06-01T09:00:00.000Z',
            ended_at: '2025-06-01T10:00:00.000Z',
            duration_seconds: 3600,
            note: '',
            is_manual: true,
            created_at: ts,
            updated_at: ts,
        };
        const create_manual_entry = vi.fn().mockResolvedValue(created);
        const on_submit = vi.fn();
        const mock_context = {
            services: {
                time_entry_service: {
                    detectOverlaps: vi.fn().mockResolvedValue([]),
                    createManualEntry: create_manual_entry,
                    resolveOverlap: vi.fn().mockResolvedValue([]),
                },
            },
            stores: {
                toast_store: { addToast: vi.fn() },
            },
        } as unknown as AppContext;

        const { getByRole, getAllByRole } = render(ManualEntryForm, {
            props: {
                context: mock_context,
                jobs: [make_job({ id: 'j-1', title: '정상 제출 작업' })],
                categories: [make_category({ id: 'c-1', name: '카테고리', parent_id: null })],
                onSubmit: on_submit,
                onCancel: vi.fn(),
            },
        });

        const combos = getAllByRole('combobox');
        await user.click(combos[0]!);
        await user.click(getByRole('option', { name: /정상 제출 작업/ }));
        await user.click(combos[1]!);
        await user.click(getByRole('option', { name: '카테고리' }));

        await user.click(getByRole('button', { name: '저장' }));

        await waitFor(() => {
            expect(create_manual_entry).toHaveBeenCalled();
        });
        expect(on_submit).toHaveBeenCalledWith(created);
    });
});
