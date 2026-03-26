import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ElapsedTimerTestWrapper from './ElapsedTimer.test.svelte';

describe('ElapsedTimer', () => {
    beforeEach(() => {
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((_cb: FrameRequestCallback) => {
            return 0 as unknown as number;
        });
        vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('정지 상태에서 00:00:00 표시', () => {
        render(ElapsedTimerTestWrapper, {
            accumulated_ms: 0,
            segment_start: null,
            is_paused: true,
        });

        const timer = screen.getByRole('timer');
        expect(timer).toHaveTextContent('00:00:00');
    });

    it('accumulated_ms 반영 (3661000 ms → 01:01:01)', () => {
        render(ElapsedTimerTestWrapper, {
            accumulated_ms: 3_661_000,
            segment_start: null,
            is_paused: true,
        });

        expect(screen.getByRole('timer')).toHaveTextContent('01:01:01');
    });

    it('role="timer" 접근성 속성', () => {
        render(ElapsedTimerTestWrapper, {
            accumulated_ms: 0,
            segment_start: null,
            is_paused: true,
            label: '작업 경과',
        });

        const timer = screen.getByRole('timer');
        expect(timer).toHaveAttribute('aria-live', 'polite');
        expect(timer).toHaveAttribute('aria-label', '작업 경과');
    });

    it('커스텀 formatter prop', () => {
        render(ElapsedTimerTestWrapper, {
            accumulated_ms: 5_000,
            segment_start: null,
            is_paused: true,
            formatter: (total_seconds: number) => `총 ${total_seconds}초`,
        });

        expect(screen.getByRole('timer')).toHaveTextContent('총 5초');
    });
});
