import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import InlineView from '../../components/InlineView/InlineView.svelte';
import { initializeApp } from '../../app/initialize';
import type { AppContext } from '../../app/context';

vi.mock('@personal/uikit', async () => {
    const { default: ElapsedTimer } = await import('../mocks/elapsed_timer_stub.svelte');
    return { ElapsedTimer };
});

describe('InlineView', () => {
    let context: AppContext;

    beforeEach(async () => {
        context = await initializeApp();
    });

    afterEach(() => {
        context.dispose();
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-INLINE-001: "이 페이지에서 시작" 버튼 렌더링', async () => {
        const { findByRole } = render(InlineView, {
            props: { context, page_uuid: 'page-uuid-1', page_title: '테스트 페이지' },
        });
        expect(await findByRole('button', { name: '이 페이지에서 시작' })).toBeInTheDocument();
    });

    it('UC-INLINE-002: 매핑된 job이 없을 때 카테고리 badge 미표시', async () => {
        const { findByRole, queryByRole } = render(InlineView, {
            props: { context, page_uuid: 'unmapped-page', page_title: '무제' },
        });
        await findByRole('button', { name: '이 페이지에서 시작' });
        expect(queryByRole('button', { name: '개발' })).not.toBeInTheDocument();
    });

    it('UC-INLINE-003: 버튼 disabled 상태 (is_starting || is_resolving)', async () => {
        vi.spyOn(context.uow.externalRefRepo, 'getExternalRefBySystemAndValue').mockReturnValue(
            new Promise(() => {
                /* never resolves — keeps is_resolving true */
            }),
        );
        const { findByRole } = render(InlineView, {
            props: { context, page_uuid: 'slow-page', page_title: '대기' },
        });
        const btn = await findByRole('button', { name: '이 페이지에서 시작' });
        expect(btn).toBeDisabled();
    });

    it('UC-INLINE-004: "이 페이지에서 시작" 버튼 클릭 시 타이머 시작 (서비스 호출 확인)', async () => {
        /** Memory UoW는 ExternalRef를 stub로 두어 upsert가 실패하므로, 이 케이스만 성공하도록 스파이한다. */
        vi.spyOn(context.uow.externalRefRepo, 'getExternalRefBySystemAndValue').mockResolvedValue(null);
        vi.spyOn(context.uow.externalRefRepo, 'upsertExternalRef').mockResolvedValue(undefined);
        const start_spy = vi.spyOn(context.services.timer_service, 'start');
        const user = userEvent.setup();
        const { findByRole } = render(InlineView, {
            props: { context, page_uuid: 'new-inline-page', page_title: '새 페이지' },
        });
        const btn = await findByRole('button', { name: '이 페이지에서 시작' });
        await waitFor(() => expect(btn).not.toBeDisabled());
        await user.click(btn);
        await waitFor(() => expect(start_spy).toHaveBeenCalled());
    });
});
