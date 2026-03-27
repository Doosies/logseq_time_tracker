import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../components/EmptyState/EmptyState.svelte';

describe('EmptyState', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-EMPTY-001: 빈 상태 메시지 "아직 작업이 없습니다" 렌더링', () => {
        const oncreate = vi.fn();
        const { getByText } = render(EmptyState, { props: { oncreate } });
        expect(getByText('아직 작업이 없습니다')).toBeInTheDocument();
    });

    it('UC-EMPTY-002: "새 작업" 버튼 클릭 시 oncreate 콜백 호출', async () => {
        const oncreate = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(EmptyState, { props: { oncreate } });
        await user.click(getByRole('button', { name: '새 작업' }));
        expect(oncreate).toHaveBeenCalledTimes(1);
    });

    it('UC-EMPTY-003: 📋 아이콘 렌더링 확인', () => {
        const oncreate = vi.fn();
        const { container } = render(EmptyState, { props: { oncreate } });
        expect(container.textContent).toContain('📋');
    });
});
