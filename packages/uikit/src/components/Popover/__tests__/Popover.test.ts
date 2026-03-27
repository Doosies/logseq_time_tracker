import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import PopoverTestWrapper from './Popover.test.svelte';

describe('Popover', () => {
    it('트리거 버튼이 렌더링된다', () => {
        render(PopoverTestWrapper, { trigger_label: '메뉴' });
        expect(screen.getByRole('button', { name: '메뉴' })).toBeInTheDocument();
    });

    it('닫힌 상태에서는 Content가 DOM에 없다', () => {
        render(PopoverTestWrapper, { content_text: '숨김 내용' });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('트리거 클릭 시 Content가 표시된다', async () => {
        const user = userEvent.setup();
        render(PopoverTestWrapper, {
            trigger_label: '토글',
            content_text: '보이는 내용',
            content_label: '설명 패널',
        });

        await user.click(screen.getByRole('button', { name: '토글' }));

        await waitFor(() => {
            expect(screen.getByRole('dialog', { name: '설명 패널' })).toBeInTheDocument();
        });
        expect(screen.getByText('보이는 내용')).toBeInTheDocument();
    });

    it('트리거를 다시 클릭하면 Content가 사라진다', async () => {
        const user = userEvent.setup();
        render(PopoverTestWrapper, {
            trigger_label: '토글',
            content_text: '패널',
            content_label: '라벨',
        });

        const trigger = screen.getByRole('button', { name: '토글' });
        await user.click(trigger);
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        await user.click(trigger);
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});
