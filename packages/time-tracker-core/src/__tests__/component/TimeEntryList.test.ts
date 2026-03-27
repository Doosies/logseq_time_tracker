import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TimeEntryList from '../../components/TimeEntryList/TimeEntryList.svelte';
import type { TimeEntry } from '../../types/time_entry';
import type { Job } from '../../types/job';
import type { Category } from '../../types/category';

vi.mock('@personal/uikit', async () => {
    const { default: DatePicker } = await import('../mocks/date_picker_stub.svelte');
    return { DatePicker };
});

vi.mock('../../components/JobSelector', async () => {
    const { default: JobSelector } = await import('../mocks/job_selector_stub.svelte');
    return { JobSelector };
});

describe('TimeEntryList', () => {
    const now = '2025-06-10T12:00:00.000Z';
    const job: Job = {
        id: 'job-1',
        title: '테스트 작업',
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
    };
    const category: Category = {
        id: 'cat-1',
        name: '개발',
        parent_id: null,
        is_active: true,
        sort_order: 0,
        created_at: now,
        updated_at: now,
    };
    const entry: TimeEntry = {
        id: 'entry-1',
        job_id: job.id,
        category_id: category.id,
        started_at: '2025-06-10T09:00:00.000Z',
        ended_at: '2025-06-10T10:30:00.000Z',
        duration_seconds: 5400,
        note: '',
        is_manual: false,
        created_at: now,
        updated_at: now,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-TEL-001: 빈 entries → "기록된 시간이 없습니다" status 표시', () => {
        const on_edit = vi.fn();
        const on_delete = vi.fn();
        const { getByRole } = render(TimeEntryList, {
            props: {
                entries: [],
                jobs: [job],
                categories: [category],
                onEdit: on_edit,
                onDelete: on_delete,
            },
        });
        const status = getByRole('status');
        expect(status).toHaveTextContent('기록된 시간이 없습니다');
    });

    it('UC-TEL-002: entries 렌더링 시 job 이름, 시간 범위, duration 표시', () => {
        const on_edit = vi.fn();
        const on_delete = vi.fn();
        const { getByText } = render(TimeEntryList, {
            props: {
                entries: [entry],
                jobs: [job],
                categories: [category],
                onEdit: on_edit,
                onDelete: on_delete,
            },
        });
        expect(getByText('테스트 작업')).toBeInTheDocument();
        expect(getByText('개발')).toBeInTheDocument();
        expect(getByText('01:30:00')).toBeInTheDocument();
    });

    it('UC-TEL-003: "수정" 버튼 클릭 → onEdit(entry.id) 호출', async () => {
        const on_edit = vi.fn();
        const on_delete = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(TimeEntryList, {
            props: {
                entries: [entry],
                jobs: [job],
                categories: [category],
                onEdit: on_edit,
                onDelete: on_delete,
            },
        });
        await user.click(getByRole('button', { name: '수정' }));
        expect(on_edit).toHaveBeenCalledWith('entry-1');
    });

    it('UC-TEL-004: "삭제" 버튼 클릭 → onDelete(entry.id) 호출', async () => {
        const on_edit = vi.fn();
        const on_delete = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(TimeEntryList, {
            props: {
                entries: [entry],
                jobs: [job],
                categories: [category],
                onEdit: on_edit,
                onDelete: on_delete,
            },
        });
        await user.click(getByRole('button', { name: '삭제' }));
        expect(on_delete).toHaveBeenCalledWith('entry-1');
    });

    it('UC-TEL-005: aria-label="시간 기록 목록" 확인', () => {
        const on_edit = vi.fn();
        const on_delete = vi.fn();
        const { getByLabelText } = render(TimeEntryList, {
            props: {
                entries: [],
                jobs: [job],
                categories: [category],
                onEdit: on_edit,
                onDelete: on_delete,
            },
        });
        expect(getByLabelText('시간 기록 목록')).toBeInTheDocument();
    });
});
