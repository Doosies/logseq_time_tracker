import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import SelectTestWrapper from './Select.test.svelte';

const sample_options = [
    { value: 'a', label: '옵션 A' },
    { value: 'b', label: '옵션 B' },
    { value: 'c', label: '옵션 C' },
];

describe('Select', () => {
    it('기본 렌더링 — select 역할이 있다', () => {
        render(SelectTestWrapper, { options: sample_options, value: 'a' });
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('옵션 목록이 표시된다', () => {
        render(SelectTestWrapper, { options: sample_options, value: 'a' });
        expect(screen.getByRole('option', { name: '옵션 A' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '옵션 B' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: '옵션 C' })).toBeInTheDocument();
    });

    it('선택 변경 시 onchange가 호출된다', async () => {
        const user = userEvent.setup();
        const handle_change = vi.fn();
        render(SelectTestWrapper, {
            options: sample_options,
            value: 'a',
            on_change: handle_change,
        });

        await user.selectOptions(screen.getByRole('combobox'), 'b');
        expect(handle_change).toHaveBeenCalledWith('b');
    });

    it('disabled 상태에서 select가 비활성화된다', () => {
        render(SelectTestWrapper, {
            options: sample_options,
            value: 'a',
            disabled: true,
        });
        expect(screen.getByRole('combobox')).toBeDisabled();
    });
});
