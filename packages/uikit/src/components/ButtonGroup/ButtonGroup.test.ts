import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import ButtonGroup from './ButtonGroup.svelte';

describe('ButtonGroup', () => {
    it('children 렌더링', () => {
        render(ButtonGroup, {
            children: createRawSnippet(() => ({
                render: () =>
                    '<div><button data-testid="btn1">버튼1</button><button data-testid="btn2">버튼2</button></div>',
            })),
        });

        expect(screen.getByTestId('btn1')).toHaveTextContent('버튼1');
        expect(screen.getByTestId('btn2')).toHaveTextContent('버튼2');
    });

    it('여러 children', () => {
        render(ButtonGroup, {
            children: createRawSnippet(() => ({
                render: () =>
                    '<div><button>1</button><button>2</button><button>3</button></div>',
            })),
        });

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(3);
        expect(buttons[0]).toHaveTextContent('1');
        expect(buttons[1]).toHaveTextContent('2');
        expect(buttons[2]).toHaveTextContent('3');
    });
});
