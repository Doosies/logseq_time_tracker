import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { createRawSnippet } from 'svelte';
import Section from './Section.svelte';

describe('Section', () => {
    it('title 렌더링', () => {
        render(Section, {
            title: '테스트 제목',
            children: createRawSnippet(() => ({
                render: () => '<p>내용</p>',
            })),
        });

        expect(screen.getByText('테스트 제목')).toBeInTheDocument();
    });

    it('title 미전달', () => {
        render(Section, {
            children: createRawSnippet(() => ({
                render: () => '<p data-testid="content">내용</p>',
            })),
        });

        expect(screen.queryByText('테스트 제목')).not.toBeInTheDocument();
        expect(screen.getByTestId('content')).toHaveTextContent('내용');
    });

    it('children 렌더링', () => {
        render(Section, {
            title: '제목',
            children: createRawSnippet(() => ({
                render: () => '<span data-testid="child">섹션 내용</span>',
            })),
        });

        expect(screen.getByTestId('child')).toHaveTextContent('섹션 내용');
    });
});
