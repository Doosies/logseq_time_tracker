import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import PromptDialogTestWrapper from './PromptDialog.test.svelte';

describe('PromptDialog', () => {
    it('제목·설명 렌더링', () => {
        render(PromptDialogTestWrapper, {
            title: '삭제 확인',
            description: '이 작업은 되돌릴 수 없습니다.',
            onconfirm: vi.fn(),
            oncancel: vi.fn(),
        });

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: '삭제 확인' })).toBeInTheDocument();
        expect(screen.getByText('이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
    });

    it('확인 콜백 호출 (이유 입력 후)', async () => {
        const user = userEvent.setup();
        const onconfirm = vi.fn();
        const oncancel = vi.fn();

        render(PromptDialogTestWrapper, {
            title: '사유 입력',
            onconfirm,
            oncancel,
        });

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, '  정리 사유  ');
        await user.click(screen.getByRole('button', { name: '확인' }));

        expect(onconfirm).toHaveBeenCalledTimes(1);
        expect(onconfirm).toHaveBeenCalledWith('정리 사유');
        expect(oncancel).not.toHaveBeenCalled();
    });

    it('취소 콜백 호출', async () => {
        const user = userEvent.setup();
        const onconfirm = vi.fn();
        const oncancel = vi.fn();

        render(PromptDialogTestWrapper, {
            title: '취소 테스트',
            onconfirm,
            oncancel,
        });

        await user.click(screen.getByRole('button', { name: '취소' }));

        expect(oncancel).toHaveBeenCalledTimes(1);
        expect(onconfirm).not.toHaveBeenCalled();
    });

    it('Enter 키로 확인', async () => {
        const user = userEvent.setup();
        const onconfirm = vi.fn();
        const oncancel = vi.fn();

        render(PromptDialogTestWrapper, {
            title: 'Enter 확인',
            onconfirm,
            oncancel,
        });

        const textarea = screen.getByRole('textbox');
        await user.type(textarea, '바로 제출');
        await user.keyboard('{Enter}');

        expect(onconfirm).toHaveBeenCalledWith('바로 제출');
    });

    it('Escape 키로 취소', async () => {
        const user = userEvent.setup();
        const onconfirm = vi.fn();
        const oncancel = vi.fn();

        render(PromptDialogTestWrapper, {
            title: 'Esc 취소',
            onconfirm,
            oncancel,
        });

        await user.type(screen.getByRole('textbox'), '무시될 내용');
        await user.keyboard('{Escape}');

        expect(oncancel).toHaveBeenCalledTimes(1);
        expect(onconfirm).not.toHaveBeenCalled();
    });

    it('max_length 초과 시 확인 비활성화', async () => {
        const onconfirm = vi.fn();
        render(PromptDialogTestWrapper, {
            title: '길이 제한',
            max_length: 5,
            onconfirm,
            oncancel: vi.fn(),
        });

        const textarea = screen.getByRole('textbox');
        fireEvent.input(textarea, { target: { value: '123456' } });

        const confirm_btn = screen.getByRole('button', { name: '확인' });
        expect(confirm_btn).toBeDisabled();
    });

    it('allow_empty=true 일 때 빈 값 확인 가능', async () => {
        const user = userEvent.setup();
        const onconfirm = vi.fn();

        render(PromptDialogTestWrapper, {
            title: '빈 값 허용',
            allow_empty: true,
            onconfirm,
            oncancel: vi.fn(),
        });

        await user.click(screen.getByRole('button', { name: '확인' }));

        expect(onconfirm).toHaveBeenCalledWith('');
    });
});
