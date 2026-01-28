import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../src/App';

describe('App Component', () => {
    it('should render the title', () => {
        render(<App />);
        expect(screen.getByText('Logseq Personal Plugin')).toBeInTheDocument();
    });

    it('should initialize count at 0', () => {
        render(<App />);
        expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });

    it('should increment count when + button is clicked', () => {
        render(<App />);
        const increment_button = screen.getByText('+');
        fireEvent.click(increment_button);
        expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });

    it('should decrement count when - button is clicked', () => {
        render(<App />);
        const increment_button = screen.getByText('+');
        const decrement_button = screen.getByText('-');

        fireEvent.click(increment_button);
        fireEvent.click(increment_button);
        fireEvent.click(decrement_button);

        expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });

    it('should reset count to 0 when Reset button is clicked', () => {
        render(<App />);
        const increment_button = screen.getByText('+');
        const reset_button = screen.getByText('Reset');

        fireEvent.click(increment_button);
        fireEvent.click(increment_button);
        fireEvent.click(reset_button);

        expect(screen.getByText('Count: 0')).toBeInTheDocument();
    });
});
