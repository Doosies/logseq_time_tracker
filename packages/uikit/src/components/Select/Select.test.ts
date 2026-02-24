import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Select from './Select.svelte';

const default_options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
    { value: 'c', label: 'Option C' },
];

describe('Select', () => {
    it('기본 렌더링', () => {
        render(Select, { options: default_options });

        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('Option B')).toBeInTheDocument();
        expect(screen.getByText('Option C')).toBeInTheDocument();
    });

    it('options 렌더링', () => {
        const options = [
            { value: 'x', label: '라벨 X' },
            { value: 'y', label: '라벨 Y' },
        ];

        render(Select, { options });

        expect(screen.getByText('라벨 X')).toBeInTheDocument();
        expect(screen.getByText('라벨 Y')).toBeInTheDocument();
    });

    it('빈 options', () => {
        render(Select, { options: [] });

        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
        expect(select.querySelectorAll('option')).toHaveLength(0);
    });

    it('값 선택 시 onchange 호출', async () => {
        const user = userEvent.setup();
        const onchange = vi.fn();

        render(Select, {
            options: default_options,
            onchange,
        });

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'b');

        expect(onchange).toHaveBeenCalledWith('b');
    });

    it('onchange 미전달', async () => {
        const user = userEvent.setup();

        render(Select, { options: default_options });

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'c');

        expect(select).toHaveValue('c');
    });

    it('disabled=true', () => {
        render(Select, {
            options: default_options,
            disabled: true,
        });

        expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('disabled 기본값', () => {
        render(Select, { options: default_options });

        expect(screen.getByRole('combobox')).not.toBeDisabled();
    });

    it('초기 value', () => {
        render(Select, {
            options: default_options,
            get value() {
                return 'b';
            },
            set value(_v: string) {},
        });

        expect(screen.getByRole('combobox')).toHaveValue('b');
    });
});
