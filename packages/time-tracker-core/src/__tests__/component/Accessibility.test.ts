import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ReasonModal from '../../components/ReasonModal/ReasonModal.svelte';
import TimerDisplay from '../../components/Timer/TimerDisplay.svelte';
import Timer from '../../components/Timer/Timer.svelte';
import { createTimerStore } from '../../stores/timer_store.svelte';
import { createJobStore } from '../../stores/job_store.svelte';
import type { Job } from '../../types/job';

describe('Accessibility', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-A11Y-001: Tab 키로 인터랙티브 요소(시작 버튼) 접근 가능', async () => {
        const user = userEvent.setup();
        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const now = new Date().toISOString();
        const job: Job = {
            id: 'a11y-job-1',
            title: '접근성 테스트 작업',
            description: '',
            status: 'pending',
            custom_fields: '{}',
            created_at: now,
            updated_at: now,
        };
        job_store.setJobs([job]);
        job_store.selectJob(job.id);

        const noop = vi.fn();
        render(Timer, {
            props: {
                timer_store,
                job_store,
                onstart: noop,
                onpause: noop,
                onresume: noop,
                onstop: noop,
                oncancel: noop,
                onswitch: noop,
            },
        });

        await user.tab();
        const active = document.activeElement;
        expect(active?.tagName).toBe('BUTTON');
        expect(active?.textContent?.trim()).toBe('시작');
    });

    it('UC-A11Y-002: ReasonModal 포커스 트랩 — textarea에 초기 포커스', async () => {
        const user = userEvent.setup();
        render(ReasonModal, {
            props: {
                title: '포커스 테스트',
                allow_empty: true,
                onconfirm: vi.fn(),
                oncancel: vi.fn(),
            },
        });

        await vi.waitFor(() => {
            expect(document.activeElement?.tagName).toBe('TEXTAREA');
        });

        await user.tab();
        expect(document.activeElement?.tagName).toBe('BUTTON');
        expect(document.activeElement?.textContent?.trim()).toBe('취소');

        await user.tab();
        expect(document.activeElement?.tagName).toBe('BUTTON');
        expect(document.activeElement?.textContent?.trim()).toBe('확인');
    });

    it('UC-A11Y-003: 모달 닫힘 시 포커스 복귀 메커니즘 — Escape로 oncancel 호출', () => {
        const oncancel = vi.fn();
        const { container } = render(ReasonModal, {
            props: {
                title: '닫기 테스트',
                onconfirm: vi.fn(),
                oncancel,
            },
        });

        const overlay = container.querySelector('[tabindex="-1"]') as HTMLElement;
        overlay.focus();
        fireEvent.keyDown(overlay, { key: 'Escape' });
        expect(oncancel).toHaveBeenCalledTimes(1);
    });

    it('UC-A11Y-004: Timer 컴포넌트 ARIA 역할 — role=timer, aria-live, aria-label', () => {
        const { getByRole } = render(TimerDisplay, {
            props: {
                accumulated_ms: 0,
                current_segment_start: null,
                is_paused: true,
            },
        });

        const timer_el = getByRole('timer');
        expect(timer_el).toHaveAttribute('aria-live', 'polite');
        expect(timer_el).toHaveAttribute('aria-label', '경과 시간');

        cleanup();

        const timer_store = createTimerStore();
        const job_store = createJobStore();
        const noop = vi.fn();
        const { container: timer_container } = render(Timer, {
            props: {
                timer_store,
                job_store,
                onstart: noop,
                onpause: noop,
                onresume: noop,
                onstop: noop,
                oncancel: noop,
                onswitch: noop,
            },
        });
        expect(timer_container.querySelector('section[aria-label="타이머"]')).toBeTruthy();
    });
});
