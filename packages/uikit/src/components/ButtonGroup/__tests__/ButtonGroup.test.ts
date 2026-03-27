import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/svelte';
import ButtonGroupTestWrapper from './ButtonGroup.test.svelte';

describe('ButtonGroup', () => {
    it('role="group"을 가진다', () => {
        render(ButtonGroupTestWrapper);
        const group = screen.getByRole('group');
        expect(group).toBeInTheDocument();
    });

    it('aria-label이 전달된다', () => {
        render(ButtonGroupTestWrapper, { aria_label: '도구 모음' });
        expect(screen.getByRole('group', { name: '도구 모음' })).toBeInTheDocument();
    });

    it('자식 버튼이 렌더링된다', () => {
        render(ButtonGroupTestWrapper);
        const group = screen.getByRole('group');
        expect(within(group).getByRole('button', { name: '첫 번째' })).toBeInTheDocument();
        expect(within(group).getByRole('button', { name: '두 번째' })).toBeInTheDocument();
    });
});
