import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SectionTestWrapper from './Section.test.svelte';

describe('Section', () => {
    it('시맨틱 section 요소를 렌더링한다', () => {
        const { container } = render(SectionTestWrapper);
        const section_el = container.querySelector('section');
        expect(section_el).toBeTruthy();
        expect(section_el).toBeInTheDocument();
    });

    it('제목 텍스트를 렌더링한다', () => {
        render(SectionTestWrapper, { title_text: '커스텀 제목' });
        expect(screen.getByText('커스텀 제목')).toBeInTheDocument();
    });

    it('콘텐츠를 렌더링한다', () => {
        render(SectionTestWrapper, { content_text: '표시할 본문' });
        expect(screen.getByText('표시할 본문')).toBeInTheDocument();
    });

    it('액션 영역의 버튼을 렌더링한다', () => {
        render(SectionTestWrapper, { action_label: '저장' });
        expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    });
});
