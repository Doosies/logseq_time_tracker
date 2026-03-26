import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import ToastContainer from '../../components/Toast/ToastContainer.svelte';
import { createToastStore } from '../../stores/toast_store.svelte';

describe('ToastContainer', () => {
    afterEach(() => {
        cleanup();
    });

    it('UC-UI-031: 빈 토스트: 아무것도 렌더링하지 않음', () => {
        const toast_store = createToastStore();
        const { queryAllByRole } = render(ToastContainer, {
            props: { toast_store },
        });
        expect(queryAllByRole('alert')).toHaveLength(0);
    });

    it('UC-UI-032: 토스트 1개: alert 역할 요소 존재', () => {
        const toast_store = createToastStore();
        toast_store.addToast('info', '알림');
        const { getByRole } = render(ToastContainer, {
            props: { toast_store },
        });
        expect(getByRole('alert')).toHaveTextContent('알림');
    });

    it('UC-UI-033: 닫기 버튼 클릭: dismissToast 호출', () => {
        const toast_store = createToastStore();
        toast_store.addToast('warning', '경고');
        const dismiss_spy = vi.spyOn(toast_store, 'dismissToast');
        const { getByRole } = render(ToastContainer, {
            props: { toast_store },
        });
        fireEvent.click(getByRole('button', { name: '닫기' }));
        expect(dismiss_spy).toHaveBeenCalledOnce();
        const called_id = dismiss_spy.mock.calls[0]![0];
        expect(toast_store.toasts.some((t) => t.id === called_id)).toBe(false);
        dismiss_spy.mockRestore();
    });
});
