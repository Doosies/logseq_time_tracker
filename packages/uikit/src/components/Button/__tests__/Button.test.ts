import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { userEvent } from '@testing-library/user-event';
import * as button_styles from '../../../design/styles/button.css';
import ButtonTestWrapper from './Button.test.svelte';

describe('Button', () => {
    it('렌더링 확인', () => {
        render(ButtonTestWrapper, { label: '제출' });
        expect(screen.getByRole('button', { name: '제출' })).toBeInTheDocument();
    });

    it.each([
        ['primary', button_styles.button_variant.primary],
        ['secondary', button_styles.button_variant.secondary],
        ['accent', button_styles.button_variant.accent],
        ['ghost', button_styles.button_variant.ghost],
    ] as const)('variant %s 렌더링 시 해당 스타일 클래스 적용', (variant, expected_class) => {
        render(ButtonTestWrapper, { label: '라벨', variant });
        const btn = screen.getByRole('button', { name: '라벨' });
        expect(btn).toHaveClass(expected_class);
    });

    it('disabled 상태일 때 비활성화된다', () => {
        render(ButtonTestWrapper, { label: '닫기', disabled: true });
        expect(screen.getByRole('button', { name: '닫기' })).toBeDisabled();
    });

    it('클릭 시 onclick 핸들러가 호출된다', async () => {
        const user = userEvent.setup();
        const handle_click = vi.fn();
        render(ButtonTestWrapper, { label: '클릭', onclick: handle_click });

        await user.click(screen.getByRole('button', { name: '클릭' }));
        expect(handle_click).toHaveBeenCalledTimes(1);
    });

    it('fullWidth일 때 전폭 스타일 클래스가 적용된다', () => {
        render(ButtonTestWrapper, { label: '전체', fullWidth: true });
        expect(screen.getByRole('button', { name: '전체' })).toHaveClass(button_styles.button_full_width);
    });
});
