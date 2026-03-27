import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import ToastTestWrapper from './Toast.test.svelte';

describe('Toast', () => {
    it('Provider 하위에 트리거와 라이브 영역이 렌더링된다', () => {
        render(ToastTestWrapper);
        expect(screen.getByRole('button', { name: '토스트 표시' })).toBeInTheDocument();
        expect(document.querySelector('[aria-live="polite"]')).toBeTruthy();
    });

    it('트리거 클릭 시 토스트 메시지가 표시된다', async () => {
        const user = userEvent.setup();
        render(ToastTestWrapper);

        await user.click(screen.getByRole('button', { name: '토스트 표시' }));

        await waitFor(() => {
            expect(screen.getByText('에러 메시지입니다.')).toBeInTheDocument();
        });

        expect(screen.getByRole('status')).toHaveTextContent('에러 메시지입니다.');
    });
});
