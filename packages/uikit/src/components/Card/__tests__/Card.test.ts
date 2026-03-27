import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { card_container } from '../../../design/styles/card.css';
import CardTestWrapper from './Card.test.svelte';

describe('Card', () => {
    it('시맨틱 구조(header, footer)와 본문 영역이 있다', () => {
        const { container } = render(CardTestWrapper);
        const root = container.firstElementChild as HTMLElement;

        expect(root).toHaveClass(card_container);
        expect(root.querySelector('header')).toBeTruthy();
        expect(root.querySelector('footer')).toBeTruthy();
    });

    it('헤더 텍스트가 렌더링된다', () => {
        render(CardTestWrapper, { header_text: '내 헤더' });
        expect(screen.getByText('내 헤더')).toBeInTheDocument();
    });

    it('바디 텍스트가 렌더링된다', () => {
        render(CardTestWrapper, { body_text: '내용 블록' });
        expect(screen.getByText('내용 블록')).toBeInTheDocument();
    });

    it('푸터 텍스트가 렌더링된다', () => {
        render(CardTestWrapper, { footer_text: '액션 영역' });
        expect(screen.getByText('액션 영역')).toBeInTheDocument();
    });
});
