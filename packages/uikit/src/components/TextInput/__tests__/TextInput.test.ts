import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import TextInputTestWrapper from './TextInput.test.svelte';

describe('TextInput', () => {
    it('기본 렌더링 — textbox 역할이 있다', () => {
        render(TextInputTestWrapper, { value: '' });
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('placeholder가 표시된다', () => {
        render(TextInputTestWrapper, {
            value: '',
            placeholder: '검색어',
        });
        expect(screen.getByPlaceholderText('검색어')).toBeInTheDocument();
    });

    it('입력 시 oninput이 호출된다', async () => {
        const user = userEvent.setup();
        const handle_input = vi.fn();
        render(TextInputTestWrapper, {
            value: '',
            on_input: handle_input,
        });

        const textbox = screen.getByRole('textbox');
        await user.type(textbox, 'x');
        expect(handle_input).toHaveBeenCalled();
        const last_call = handle_input.mock.calls[handle_input.mock.calls.length - 1]?.[0];
        expect(last_call).toBe('x');
    });

    it('disabled 상태에서 input이 비활성화된다', () => {
        render(TextInputTestWrapper, {
            value: '읽기전용',
            disabled: true,
        });
        expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('type 속성이 input에 반영된다', () => {
        const { container } = render(TextInputTestWrapper, {
            value: '',
            rest_attrs: { type: 'password' },
        });
        const input_el = container.querySelector('input');
        expect(input_el).toBeTruthy();
        expect(input_el).toHaveAttribute('type', 'password');
    });
});
