import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import { ElapsedTimer } from '@personal/uikit';

describe('ElapsedTimer', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-UI-001: 정지 상태: 00:00:00 표시', () => {
        const { getByRole } = render(ElapsedTimer, {
            props: {
                accumulated_ms: 0,
                segment_start: null,
                is_paused: true,
            },
        });
        const timer = getByRole('timer');
        expect(timer).toHaveTextContent('00:00:00');
    });

    it('UC-UI-003: accumulated_ms 있을 때: 올바른 시간 표시', () => {
        const accumulated_ms = (1 * 3600 + 1 * 60 + 1) * 1000;
        const { getByRole } = render(ElapsedTimer, {
            props: {
                accumulated_ms,
                segment_start: null,
                is_paused: true,
            },
        });
        expect(getByRole('timer')).toHaveTextContent('01:01:01');
    });

    it('role="timer" 존재 확인', () => {
        const { getByRole } = render(ElapsedTimer, {
            props: {
                accumulated_ms: 0,
                segment_start: null,
                is_paused: true,
            },
        });
        expect(getByRole('timer')).toBeTruthy();
    });

    it('aria-live="polite" 존재 확인', () => {
        const { getByRole } = render(ElapsedTimer, {
            props: {
                accumulated_ms: 0,
                segment_start: null,
                is_paused: true,
            },
        });
        expect(getByRole('timer')).toHaveAttribute('aria-live', 'polite');
    });
});
