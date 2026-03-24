import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import ReasonModal from '../../components/ReasonModal/ReasonModal.svelte';
import { STRINGS } from '../../constants/strings';
import { MAX_REASON_LENGTH } from '../../constants/config';

describe('ReasonModal', () => {
    afterEach(() => {
        cleanup();
    });

    it('초기 렌더링: textarea 존재, 확인 버튼 disabled (빈 텍스트)', () => {
        const { container, getByRole } = render(ReasonModal, {
            props: {
                title: '제목',
                onconfirm: vi.fn(),
                oncancel: vi.fn(),
            },
        });
        expect(container.querySelector('textarea')).toBeTruthy();
        const confirm = getByRole('button', { name: STRINGS.reason_modal.confirm });
        expect(confirm).toBeDisabled();
    });

    it('1글자 이상 입력 후 확인 버튼 enabled', async () => {
        const user = userEvent.setup();
        const { getByRole, container } = render(ReasonModal, {
            props: {
                title: '제목',
                onconfirm: vi.fn(),
                oncancel: vi.fn(),
            },
        });
        const textarea = container.querySelector('textarea')!;
        await user.type(textarea, 'a');
        const confirm = getByRole('button', { name: STRINGS.reason_modal.confirm });
        expect(confirm).not.toBeDisabled();
    });

    it('Escape 키 → oncancel 호출', async () => {
        const oncancel = vi.fn();
        const { container } = render(ReasonModal, {
            props: {
                title: '제목',
                onconfirm: vi.fn(),
                oncancel,
            },
        });
        const overlay = container.querySelector('[tabindex="-1"]') as HTMLElement;
        overlay.focus();
        fireEvent.keyDown(overlay, { key: 'Escape' });
        expect(oncancel).toHaveBeenCalledTimes(1);
    });

    it('글자 수 표시: {현재}/{500}', () => {
        const { getByText } = render(ReasonModal, {
            props: {
                title: '제목',
                onconfirm: vi.fn(),
                oncancel: vi.fn(),
            },
        });
        expect(getByText(`0/${MAX_REASON_LENGTH}`)).toBeTruthy();
    });

    it('role="dialog" 존재 확인', () => {
        const { getByRole } = render(ReasonModal, {
            props: {
                title: '제목',
                onconfirm: vi.fn(),
                oncancel: vi.fn(),
            },
        });
        expect(getByRole('dialog')).toBeTruthy();
    });
});
