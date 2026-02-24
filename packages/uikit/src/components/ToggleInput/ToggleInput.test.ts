import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ToggleInput from './ToggleInput.svelte';

const default_options = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
];

describe('ToggleInput', () => {
    it('기본 렌더링(isTextMode=false)', () => {
        render(ToggleInput, { options: default_options });

        expect(screen.getByRole('combobox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle input mode/i })).toBeInTheDocument();
    });

    it('isTextMode=true', () => {
        render(ToggleInput, {
            options: default_options,
            isTextMode: true,
        });

        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /toggle input mode/i })).toBeInTheDocument();
    });

    it('토글 버튼 존재', () => {
        render(ToggleInput, { options: default_options });

        expect(screen.getByRole('button', { name: 'Toggle input mode' })).toBeInTheDocument();
    });

    it('토글 버튼 아이콘', () => {
        render(ToggleInput, { options: default_options });

        const button = screen.getByRole('button', { name: 'Toggle input mode' });
        expect(button).toHaveTextContent('✏️');
    });

    it('onToggle 호출', async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();

        render(ToggleInput, {
            options: default_options,
            onToggle,
        });

        const button = screen.getByRole('button', { name: 'Toggle input mode' });
        await user.click(button);

        expect(onToggle).toHaveBeenCalledOnce();
    });

    it('Select 모드 값 변경', async () => {
        const user = userEvent.setup();
        const onchange = vi.fn();

        render(ToggleInput, {
            options: default_options,
            isTextMode: false,
            onchange,
        });

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'b');

        expect(onchange).toHaveBeenCalledWith('b');
    });

    it('TextInput 모드 입력', async () => {
        const user = userEvent.setup();
        const onchange = vi.fn();

        render(ToggleInput, {
            options: default_options,
            isTextMode: true,
            onchange,
        });

        const input = screen.getByRole('textbox');
        await user.type(input, 'hello');

        expect(onchange).toHaveBeenCalled();
    });

    it('prefix 렌더링', () => {
        render(ToggleInput, {
            options: default_options,
            prefix: '서버:',
        });

        expect(screen.getByText('서버:')).toBeInTheDocument();
    });

    it('prefix 빈 문자열', () => {
        render(ToggleInput, {
            options: default_options,
            prefix: '',
        });

        expect(screen.queryByText('서버:')).not.toBeInTheDocument();
    });
});
