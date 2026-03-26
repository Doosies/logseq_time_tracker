import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TimeRangePickerTestWrapper from './TimeRangePicker.test.svelte';

describe('TimeRangePicker', () => {
    it('시작·종료 날짜 렌더링', () => {
        const on_change = vi.fn();
        render(TimeRangePickerTestWrapper, {
            started_at: '2025-03-15T09:30:00.000Z',
            ended_at: '2025-03-20T18:00:00.000Z',
            onChange: on_change,
        });

        expect(screen.getByText('시작')).toBeInTheDocument();
        expect(screen.getByText('종료')).toBeInTheDocument();

        const dialog_triggers = screen
            .getAllByRole('button')
            .filter((btn) => btn.getAttribute('aria-haspopup') === 'dialog');
        expect(dialog_triggers.length).toBe(2);
        const start_trigger = dialog_triggers[0]!;
        const end_trigger = dialog_triggers[1]!;
        expect(start_trigger.textContent).toMatch(/^\d{4}-\d{2}-\d{2}/);
        expect(end_trigger.textContent).toMatch(/^\d{4}-\d{2}-\d{2}/);
    });

    it('유효하지 않은 범위(시작 > 종료) 시 에러 표시', () => {
        const on_change = vi.fn();
        render(TimeRangePickerTestWrapper, {
            started_at: '2026-01-10T12:00:00.000Z',
            ended_at: '2026-01-01T08:00:00.000Z',
            onChange: on_change,
            error_message: '시작이 종료보다 늦습니다',
        });

        expect(screen.getByRole('alert')).toHaveTextContent('시작이 종료보다 늦습니다');
    });
});
