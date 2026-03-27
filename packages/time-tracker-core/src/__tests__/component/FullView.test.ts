import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import FullView from '../../components/FullView/FullView.svelte';
import { initializeApp } from '../../app/initialize';
import type { AppContext } from '../../app/context';

describe('FullView', () => {
    let context: AppContext;

    beforeEach(async () => {
        context = await initializeApp();
    });

    afterEach(() => {
        context.dispose();
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FULL-001: compact 모드에서 탭(작업/기록/설정) 렌더링 확인 (role="tablist")', () => {
        const { getByRole } = render(FullView, {
            props: { context, layout_mode: 'compact' },
        });
        expect(getByRole('tablist', { name: '화면 구역' })).toBeInTheDocument();
        expect(getByRole('tab', { name: '작업' })).toBeInTheDocument();
        expect(getByRole('tab', { name: '기록' })).toBeInTheDocument();
        expect(getByRole('tab', { name: '설정' })).toBeInTheDocument();
    });

    it('UC-FULL-002: compact 모드에서 "작업" 탭이 기본 선택됨 (aria-selected="true")', () => {
        const { getByRole } = render(FullView, {
            props: { context, layout_mode: 'compact' },
        });
        expect(getByRole('tab', { name: '작업' })).toHaveAttribute('aria-selected', 'true');
        expect(getByRole('tab', { name: '기록' })).toHaveAttribute('aria-selected', 'false');
    });

    it('UC-FULL-003: job이 없을 때 EmptyState 렌더링 ("아직 작업이 없습니다")', () => {
        const { getByText } = render(FullView, {
            props: { context, layout_mode: 'compact' },
        });
        expect(getByText('아직 작업이 없습니다')).toBeInTheDocument();
    });

    it('UC-FULL-004: full 모드에서 sidebar와 main column 렌더링 (aria-label="작업 목록")', () => {
        const { getByLabelText, getByRole } = render(FullView, {
            props: { context, layout_mode: 'full' },
        });
        expect(getByLabelText('작업 목록')).toBeInTheDocument();
        expect(getByRole('region', { name: '타이머' })).toBeInTheDocument();
    });

    it('UC-FULL-005: compact 모드 탭 클릭 시 패널 전환', async () => {
        const user = userEvent.setup();
        const { getByRole } = render(FullView, {
            props: { context, layout_mode: 'compact' },
        });
        await user.click(getByRole('tab', { name: '기록' }));
        expect(getByRole('tab', { name: '기록' })).toHaveAttribute('aria-selected', 'true');
        expect(getByRole('tab', { name: '작업' })).toHaveAttribute('aria-selected', 'false');
        await user.click(getByRole('tab', { name: '설정' }));
        expect(getByRole('tab', { name: '설정' })).toHaveAttribute('aria-selected', 'true');
    });
});
