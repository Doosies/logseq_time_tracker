import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import DatePickerTestWrapper from './DatePicker.test.svelte';

describe('DatePicker', () => {
    it('트리거 버튼에 "날짜 선택" 표시', () => {
        render(DatePickerTestWrapper, {
            value: null,
            onSelect: vi.fn(),
        });

        const trigger = screen.getByRole('button', { name: /날짜 선택/i });
        expect(trigger).toBeInTheDocument();
    });

    it('클릭 시 달력 패널 열림', async () => {
        const user = userEvent.setup();
        render(DatePickerTestWrapper, {
            value: null,
            onSelect: vi.fn(),
        });

        await user.click(screen.getByRole('button', { name: /날짜 선택/i }));

        expect(screen.getByRole('dialog', { name: '달력' })).toBeInTheDocument();
        expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('날짜 선택 시 onSelect 콜백 호출', async () => {
        const user = userEvent.setup();
        const on_select = vi.fn();

        render(DatePickerTestWrapper, {
            value: '2025-06-01',
            onSelect: on_select,
        });

        await user.click(screen.getByRole('button', { name: /2025-06-01/ }));

        const panel = screen.getByRole('dialog', { name: '달력' });
        const day_18 = within(panel).getByRole('gridcell', { name: '18' });
        await user.click(day_18);

        expect(on_select).toHaveBeenCalledWith('2025-06-18');
    });

    it('min/max 범위 밖 날짜 비활성화', async () => {
        const user = userEvent.setup();

        render(DatePickerTestWrapper, {
            value: '2025-06-16',
            onSelect: vi.fn(),
            min: '2025-06-15',
            max: '2025-06-20',
        });

        await user.click(screen.getByRole('button', { name: /2025-06-16/ }));

        const panel = screen.getByRole('dialog', { name: '달력' });
        const too_early = within(panel).getByRole('gridcell', { name: '14' });
        const in_range = within(panel).getByRole('gridcell', { name: '16' });

        expect(too_early).toBeDisabled();
        expect(in_range).not.toBeDisabled();
    });
});
