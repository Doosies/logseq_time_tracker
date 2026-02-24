import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TextInput from './TextInput.svelte';

describe('TextInput', () => {
    it('기본 렌더링', () => {
        render(TextInput);

        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('placeholder', () => {
        render(TextInput, { placeholder: '이메일 입력' });

        expect(screen.getByPlaceholderText('이메일 입력')).toBeInTheDocument();
    });

    it('placeholder 기본값', () => {
        render(TextInput);

        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('placeholder', '');
    });

    it('입력 이벤트', async () => {
        const user = userEvent.setup();
        const oninput = vi.fn();

        render(TextInput, { oninput });

        const input = screen.getByRole('textbox');
        await user.type(input, 'hello');

        expect(oninput).toHaveBeenCalled();
    });

    it('oninput 미전달', async () => {
        const user = userEvent.setup();

        render(TextInput);

        const input = screen.getByRole('textbox');
        await user.type(input, 'test');

        expect(input).toHaveValue('test');
    });

    it('disabled=true', () => {
        render(TextInput, { disabled: true });

        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('disabled 기본값', () => {
        render(TextInput);

        expect(screen.getByRole('textbox')).not.toBeDisabled();
    });

    it('초기 value', () => {
        render(TextInput, {
            get value() {
                return '초기값';
            },
            set value(_v: string) {},
        });

        expect(screen.getByRole('textbox')).toHaveValue('초기값');
    });
});
