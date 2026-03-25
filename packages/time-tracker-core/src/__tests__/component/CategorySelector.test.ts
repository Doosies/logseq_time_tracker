import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CategorySelector from '../../components/CategorySelector/CategorySelector.svelte';
import type { Category } from '../../types/category';

const ts = '2025-01-01T00:00:00.000Z';

function make_category(partial: Partial<Category> & Pick<Category, 'id' | 'name' | 'parent_id'>): Category {
    return {
        sort_order: 0,
        is_active: true,
        created_at: ts,
        updated_at: ts,
        ...partial,
    };
}

describe('CategorySelector', () => {
    afterEach(() => {
        cleanup();
    });

    it('UC-UI-009: 폴더 중첩 탐색 시 하위 리프 항목이 표시됨', async () => {
        const user = userEvent.setup();
        const categories: Category[] = [
            make_category({ id: 'proj', name: '프로젝트', parent_id: null, sort_order: 1 }),
            make_category({ id: 'main', name: '메인업무', parent_id: 'proj', sort_order: 1 }),
            make_category({ id: 'task', name: '작업', parent_id: 'main', sort_order: 1 }),
        ];
        const on_select = vi.fn();
        const { getByRole } = render(CategorySelector, {
            props: {
                categories,
                selected_id: null,
                onSelect: on_select,
            },
        });

        const trigger = getByRole('combobox');
        await user.click(trigger);
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        await user.click(getByRole('option', { name: /프로젝트\s*하위/ }));
        expect(getByRole('option', { name: /메인업무\s*하위/ })).toBeTruthy();

        await user.click(getByRole('option', { name: /메인업무\s*하위/ }));
        expect(getByRole('option', { name: '작업' })).toBeTruthy();
    });

    it('UC-UI-010: 검색어에 맞는 카테고리만 목록에 표시됨', async () => {
        const user = userEvent.setup();
        const categories: Category[] = Array.from({ length: 12 }, (_, i) =>
            make_category({
                id: `c-${i}`,
                name: i === 3 ? '프론트엔드 개발' : i === 7 ? '백엔드 개발' : `항목-${i}`,
                parent_id: null,
                sort_order: i,
            }),
        );
        const { getByRole, queryByRole } = render(CategorySelector, {
            props: {
                categories,
                selected_id: null,
                onSelect: vi.fn(),
            },
        });

        await user.click(getByRole('combobox'));
        const search = getByRole('searchbox');
        await user.type(search, '개발');

        expect(getByRole('option', { name: '프론트엔드 개발' })).toBeTruthy();
        expect(getByRole('option', { name: '백엔드 개발' })).toBeTruthy();
        expect(queryByRole('option', { name: /항목-/ })).toBeNull();
    });
});
