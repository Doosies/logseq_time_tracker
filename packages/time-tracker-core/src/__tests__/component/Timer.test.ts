import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Timer from '../../components/Timer/Timer.svelte';
import { createTimerStore } from '../../stores/timer_store.svelte';
import { createJobStore } from '../../stores/job_store.svelte';
import type { Job } from '../../types/job';

describe('Timer', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-UI-002: Timer 컴포넌트 "시작" 버튼 클릭 → onStart 콜백', async () => {
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const now = new Date().toISOString();
        const job: Job = {
            id: 'job-test-1',
            title: '테스트 작업',
            description: '',
            status: 'pending',
            custom_fields: '{}',
            created_at: now,
            updated_at: now,
        };
        job_store.setJobs([job]);
        job_store.selectJob(job.id);

        const onstart = vi.fn();
        const noop = vi.fn();

        const user = userEvent.setup();
        const { getByRole } = render(Timer, {
            props: {
                timer_store,
                job_store,
                onstart,
                onpause: noop,
                onresume: noop,
                onstop: noop,
                oncancel: noop,
                onswitch: noop,
            },
        });

        await user.click(getByRole('button', { name: '시작' }));
        expect(onstart).toHaveBeenCalledTimes(1);
    });
});
