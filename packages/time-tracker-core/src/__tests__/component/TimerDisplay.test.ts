import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import TimerDisplay from '../../components/Timer/TimerDisplay.svelte';

describe('TimerDisplay', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('정지 상태: 00:00:00 표시', () => {
        const { getByRole } = render(TimerDisplay, {
            props: {
                accumulated_ms: 0,
                current_segment_start: null,
                is_paused: true,
            },
        });
        const timer = getByRole('timer');
        expect(timer).toHaveTextContent('00:00:00');
    });

    it('accumulated_ms 있을 때: 올바른 시간 표시', () => {
        const accumulated_ms = (1 * 3600 + 1 * 60 + 1) * 1000;
        const { getByRole } = render(TimerDisplay, {
            props: {
                accumulated_ms,
                current_segment_start: null,
                is_paused: true,
            },
        });
        expect(getByRole('timer')).toHaveTextContent('01:01:01');
    });

    it('role="timer" 존재 확인', () => {
        const { getByRole } = render(TimerDisplay, {
            props: {
                accumulated_ms: 0,
                current_segment_start: null,
                is_paused: true,
            },
        });
        expect(getByRole('timer')).toBeTruthy();
    });

    it('aria-live="polite" 존재 확인', () => {
        const { getByRole } = render(TimerDisplay, {
            props: {
                accumulated_ms: 0,
                current_segment_start: null,
                is_paused: true,
            },
        });
        expect(getByRole('timer')).toHaveAttribute('aria-live', 'polite');
    });
});
