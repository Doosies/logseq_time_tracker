import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import JobSelector from '../../components/JobSelector/JobSelector.svelte';
import type { Job } from '../../types/job';

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

describe('JobSelector', () => {
    afterEach(() => {
        cleanup();
    });

    it('UC-UI-010: 제목 검색 시 일치하는 작업만 표시됨', async () => {
        const user = userEvent.setup();
        const jobs: Job[] = [
            make_job({ id: 'j1', title: '프론트 대시보드', status: 'pending' }),
            make_job({ id: 'j2', title: 'API 서버', status: 'in_progress' }),
            make_job({ id: 'j3', title: '프론트 리팩터', status: 'paused' }),
        ];
        const { getByRole, queryByRole } = render(JobSelector, {
            props: {
                jobs,
                selected_id: null,
                onSelect: vi.fn(),
            },
        });

        await user.click(getByRole('combobox'));
        const search = getByRole('searchbox');
        await user.type(search, '프론트');

        expect(getByRole('option', { name: /프론트 대시보드/ })).toBeTruthy();
        expect(getByRole('option', { name: /프론트 리팩터/ })).toBeTruthy();
        expect(queryByRole('option', { name: /API 서버/ })).toBeNull();
    });
});
