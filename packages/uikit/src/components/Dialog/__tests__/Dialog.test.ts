import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DialogStoryWrapper from './DialogStoryWrapper.svelte';

describe('Dialog', () => {
    it('트리거 클릭 시 다이얼로그가 열리고, ESC 키로 닫을 수 있어야 함', async () => {
        const user = userEvent.setup();
        render(DialogStoryWrapper, { title: '테스트', description: '설명' });

        const trigger = screen.getByRole('button', { name: '열기' });
        expect(trigger).toBeInTheDocument();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        await user.click(trigger);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('테스트')).toBeInTheDocument();
        expect(screen.getByText('설명')).toBeInTheDocument();

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('배경(오버레이) 클릭 시 다이얼로그가 닫혀야 함', async () => {
        const user = userEvent.setup();
        render(DialogStoryWrapper, { title: '배경 클릭 테스트' });

        await user.click(screen.getByRole('button', { name: '열기' }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const overlay = document.body.querySelector('[data-dialog-overlay]');
        expect(overlay).toBeInTheDocument();
        await user.click(overlay as HTMLElement);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('폼이 있을 때 포커스가 다이얼로그 내부에 있어야 함', async () => {
        const user = userEvent.setup();
        render(DialogStoryWrapper, { title: '폼 테스트', showForm: true });

        await user.click(screen.getByRole('button', { name: '열기' }));

        const dialog = screen.getByRole('dialog');
        await waitFor(() => {
            expect(document.activeElement).not.toBeNull();
            expect(dialog.contains(document.activeElement)).toBe(true);
        });
    });

    it('Tab 키로 포커스가 다이얼로그 내에서 순회되어야 함', async () => {
        const user = userEvent.setup();
        render(DialogStoryWrapper, { title: '포커스 트랩', showForm: true });

        await user.click(screen.getByRole('button', { name: '열기' }));

        const input = screen.getByLabelText('이름');
        await user.click(input);
        expect(input).toHaveFocus();

        await user.tab();
        const textarea = screen.getByLabelText('코드');
        expect(textarea).toHaveFocus();

        await user.tab();
        const submit_btn = screen.getByRole('button', { name: '저장' });
        expect(submit_btn).toHaveFocus();
    });
});
