import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DndTestWrapper from './Dnd.test.svelte';

describe('Dnd', () => {
    it('Provider와 Sortable 자식이 기본 렌더링된다', () => {
        render(DndTestWrapper, {
            items: [
                { id: '1', label: '행 1' },
                { id: '2', label: '행 2' },
            ],
        });

        expect(screen.getByText('행 1')).toBeInTheDocument();
        expect(screen.getByText('행 2')).toBeInTheDocument();
        expect(screen.getAllByTestId('sortable-row')).toHaveLength(2);
    });
});
