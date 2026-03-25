import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DatePicker from '../../components/DatePicker/DatePicker.svelte';

describe('DatePicker', () => {
    afterEach(() => {
        cleanup();
    });

    it('UC-UI-011: 달력에서 날짜 선택 시 onSelect가 YYYY-MM-DD로 호출됨', async () => {
        const user = userEvent.setup();
        const on_select = vi.fn();
        const { getByRole } = render(DatePicker, {
            props: {
                value: '2030-06-15',
                onSelect: on_select,
            },
        });

        const trigger = getByRole('button', { name: '2030-06-15' });
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        const day_cell = getByRole('gridcell', { name: '15', selected: true });
        await user.click(day_cell);

        expect(on_select).toHaveBeenCalledWith('2030-06-15');
    });
});
