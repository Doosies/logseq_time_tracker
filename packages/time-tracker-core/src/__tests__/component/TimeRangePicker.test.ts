import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { TimeRangePicker } from '@personal/uikit';

describe('TimeRangePicker', () => {
    afterEach(() => {
        cleanup();
    });

    it('UC-UI-012: 시작이 종료보다 늦으면 경고가 표시되고 유효해지면 onChange가 호출됨', async () => {
        const on_change = vi.fn();
        const { getByRole, unmount } = render(TimeRangePicker, {
            props: {
                started_at: '2025-06-10T14:00:00.000Z',
                ended_at: '2025-06-10T10:00:00.000Z',
                onChange: on_change,
            },
        });

        const alert = getByRole('alert');
        expect(alert).toHaveTextContent('시작 시각은 종료 시각보다 이전이거나 같아야 합니다');
        expect(on_change).not.toHaveBeenCalled();

        unmount();
        on_change.mockClear();

        const user = userEvent.setup();
        const view = render(TimeRangePicker, {
            props: {
                started_at: '2025-06-10T10:00:00.000Z',
                ended_at: '2025-06-10T12:00:00.000Z',
                onChange: on_change,
            },
        });

        const end_time = view.getByLabelText('종료 시각');
        await user.clear(end_time);
        await user.type(end_time, '23:59');
        await tick();
        await tick();

        expect(on_change).toHaveBeenCalled();
    });
});
