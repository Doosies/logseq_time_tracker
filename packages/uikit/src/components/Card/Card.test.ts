import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import Card from './Card.svelte';

describe('Card', () => {
    it('children 렌더링', () => {
        render(Card, {
            children: createRawSnippet(() => ({
                render: () => '<span data-testid="child">카드 내용</span>',
            })),
        });

        expect(screen.getByTestId('child')).toHaveTextContent('카드 내용');
    });

    it('DOM 구조', () => {
        const { container } = render(Card, {
            children: createRawSnippet(() => ({
                render: () => '<p>내용</p>',
            })),
        });

        const wrapper = container.firstElementChild;
        expect(wrapper).toBeInTheDocument();
        expect(wrapper?.tagName).toBe('DIV');
        expect(wrapper).toContainElement(screen.getByText('내용'));
    });
});
