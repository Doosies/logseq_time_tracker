import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import Button from './Button.svelte';

describe('Button', () => {
    it('기본 렌더링', () => {
        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Click</span>',
            })),
        });

        expect(screen.getByRole('button')).toBeInTheDocument();
        expect(screen.getByText('Click')).toBeInTheDocument();
    });

    it('children 렌더링', () => {
        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span data-testid="child">버튼 텍스트</span>',
            })),
        });

        expect(screen.getByTestId('child')).toHaveTextContent('버튼 텍스트');
    });

    it('onclick 호출', async () => {
        const user = userEvent.setup();
        const onclick = vi.fn();

        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Click</span>',
            })),
            onclick,
        });

        const button = screen.getByRole('button');
        await user.click(button);

        expect(onclick).toHaveBeenCalledOnce();
    });

    it('onclick undefined', async () => {
        const user = userEvent.setup();

        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Click</span>',
            })),
        });

        const button = screen.getByRole('button');
        await user.click(button);

        expect(button).toBeInTheDocument();
    });

    it('disabled=true', () => {
        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Disabled</span>',
            })),
            disabled: true,
        });

        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disabled 기본값', () => {
        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Default</span>',
            })),
        });

        expect(screen.getByRole('button')).not.toBeDisabled();
    });

    it('fullWidth=true', () => {
        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Full</span>',
            })),
            fullWidth: true,
        });

        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('fullWidth 기본값', () => {
        render(Button, {
            children: createRawSnippet(() => ({
                render: () => '<span>Default</span>',
            })),
        });

        expect(screen.getByRole('button')).toBeInTheDocument();
    });
});
