import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import JobList from '../../components/JobList/JobList.svelte';
import type { Job } from '../../types';

function make_job(id: string, title: string): Job {
    const now = new Date().toISOString();
    return {
        id,
        title,
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
    };
}

describe('JobList', () => {
    afterEach(() => {
        cleanup();
    });

    it('빈 배열: 아무것도 렌더링하지 않음', () => {
        const { queryAllByRole } = render(JobList, {
            props: {
                jobs: [],
                selected_job_id: null,
                onselect: vi.fn(),
            },
        });
        expect(queryAllByRole('listitem')).toHaveLength(0);
    });

    it('Job 3개: 3개의 listitem 렌더링', () => {
        const jobs = [make_job('1', 'a'), make_job('2', 'b'), make_job('3', 'c')];
        const { getAllByRole } = render(JobList, {
            props: {
                jobs,
                selected_job_id: null,
                onselect: vi.fn(),
            },
        });
        expect(getAllByRole('listitem')).toHaveLength(3);
    });

    it('선택 하이라이트: selected_job_id와 일치하는 항목', () => {
        const jobs = [make_job('x', '첫'), make_job('y', '둘')];
        const { getAllByRole } = render(JobList, {
            props: {
                jobs,
                selected_job_id: 'y',
                onselect: vi.fn(),
            },
        });
        const items = getAllByRole('button');
        const selected = items.find((el) => el.getAttribute('aria-current') === 'true');
        expect(selected).toBeTruthy();
        expect(selected?.textContent).toContain('둘');
    });

    it('클릭 시 onselect 호출', () => {
        const onselect = vi.fn();
        const jobs = [make_job('click-me', '클릭')];
        const { getByRole } = render(JobList, {
            props: {
                jobs,
                selected_job_id: null,
                onselect,
            },
        });
        fireEvent.click(getByRole('button', { name: /클릭/ }));
        expect(onselect).toHaveBeenCalledWith('click-me');
    });

    it('time_totals: 누적 시간이 0보다 크면 HH:MM:SS 표시', () => {
        const jobs = [make_job('j1', '작업A')];
        const time_totals = new Map<string, number>([['j1', 3661]]);
        const { getByRole } = render(JobList, {
            props: {
                jobs,
                selected_job_id: null,
                time_totals,
                onselect: vi.fn(),
            },
        });
        const btn = getByRole('button', { name: /작업A/ });
        expect(btn.textContent).toContain('01:01:01');
    });
});
