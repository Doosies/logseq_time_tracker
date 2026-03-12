import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import TooltipTestWrapper from './__tests__/Tooltip.test.svelte';

describe('Tooltip', () => {
    it('호버 시 툴팁 표시 확인', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '테스트 툴팁' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toBeInTheDocument();
        expect(tooltip).toHaveTextContent('테스트 툴팁');
    });

    it('content prop 렌더링 확인', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '커스텀 콘텐츠' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        expect(screen.getByRole('tooltip')).toHaveTextContent('커스텀 콘텐츠');
    });

    it('position prop 동작 확인 - top', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '상단', position: 'top' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        await waitFor(() => {
            const content_el = tooltip.querySelector('[data-position]');
            expect(content_el).toBeTruthy();
            expect(content_el).toHaveAttribute('data-position', 'top');
        });
    });

    it('position prop 동작 확인 - bottom', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '하단', position: 'bottom' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        await waitFor(() => {
            const content_el = tooltip.querySelector('[data-position]');
            expect(content_el).toBeTruthy();
            expect(content_el).toHaveAttribute('data-position', 'bottom');
        });
    });

    it('position prop 동작 확인 - left', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '왼쪽', position: 'left' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        await waitFor(() => {
            const content_el = tooltip.querySelector('[data-position]');
            expect(content_el).toBeTruthy();
            expect(content_el).toHaveAttribute('data-position', 'left');
        });
    });

    it('position prop 동작 확인 - right', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '오른쪽', position: 'right' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        await waitFor(() => {
            const content_el = tooltip.querySelector('[data-position]');
            expect(content_el).toBeTruthy();
            expect(content_el).toHaveAttribute('data-position', 'right');
        });
    });

    it('disabled prop 확인 - 호버 시 툴팁 미표시', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '비활성화', disabled: true });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });

    it('role="tooltip" 속성 확인', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '접근성 테스트' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        expect(tooltip).toHaveAttribute('role', 'tooltip');
    });

    it('aria-describedby 연결 확인', async () => {
        const user = userEvent.setup();
        render(TooltipTestWrapper, { content: '연결 테스트' });

        const trigger = screen.getByRole('button', { name: '호버 대상' });
        await user.hover(trigger);

        const tooltip = screen.getByRole('tooltip');
        const tooltip_id = tooltip.id;
        expect(tooltip_id).toBeTruthy();

        const wrapper = trigger.closest('[role="group"]');
        expect(wrapper).toHaveAttribute('aria-describedby', tooltip_id);
    });
});
