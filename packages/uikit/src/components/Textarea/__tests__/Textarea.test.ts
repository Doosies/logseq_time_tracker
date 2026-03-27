import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import TextareaTestWrapper from './Textarea.test.svelte';

describe('Textarea', () => {
    it('기본 렌더링 — textbox 역할이 있다', () => {
        render(TextareaTestWrapper, { value: '' });
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('placeholder가 표시된다', () => {
        render(TextareaTestWrapper, {
            value: '',
            placeholder: '내용을 입력하세요',
        });
        expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeInTheDocument();
    });

    it('입력 시 oninput이 호출된다', async () => {
        const user = userEvent.setup();
        const handle_input = vi.fn();
        render(TextareaTestWrapper, {
            value: '',
            on_input: handle_input,
        });

        const textbox = screen.getByRole('textbox');
        await user.type(textbox, '안녕');
        expect(handle_input).toHaveBeenCalled();
        const last_call = handle_input.mock.calls[handle_input.mock.calls.length - 1]?.[0];
        expect(last_call).toBe('안녕');
    });

    it('disabled 상태에서 textarea가 비활성화된다', () => {
        render(TextareaTestWrapper, {
            value: '고정',
            disabled: true,
        });
        expect(screen.getByRole('textbox')).toBeDisabled();
    });
});
