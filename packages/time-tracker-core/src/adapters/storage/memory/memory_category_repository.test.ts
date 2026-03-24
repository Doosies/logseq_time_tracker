import { describe, expect, it } from 'vitest';
import type { Category } from '../../../types/category';
import { MemoryCategoryRepository } from './memory_category_repository';

function makeCategory(overrides: Partial<Category> = {}): Category {
    const now = '2025-01-01T00:00:00.000Z';
    return {
        id: 'cat-1',
        name: '개발',
        parent_id: null,
        is_active: true,
        sort_order: 1,
        created_at: now,
        updated_at: now,
        ...overrides,
    };
}

describe('MemoryCategoryRepository', () => {
    it('upsertCategory + getCategoryById', async () => {
        const repo = new MemoryCategoryRepository();
        const c = makeCategory();
        await repo.upsertCategory(c);
        const got = await repo.getCategoryById('cat-1');
        expect(got?.name).toBe('개발');
    });

    it('getCategories: 모든 카테고리 반환', async () => {
        const repo = new MemoryCategoryRepository();
        await repo.upsertCategory(makeCategory({ id: 'a', name: 'A' }));
        await repo.upsertCategory(makeCategory({ id: 'b', name: 'B', sort_order: 2 }));
        const all = await repo.getCategories();
        expect(all).toHaveLength(2);
    });

    it('deleteCategory: 삭제 후 getCategoryById null', async () => {
        const repo = new MemoryCategoryRepository();
        await repo.upsertCategory(makeCategory());
        await repo.deleteCategory('cat-1');
        expect(await repo.getCategoryById('cat-1')).toBeNull();
    });

    it('structuredClone 격리', async () => {
        const repo = new MemoryCategoryRepository();
        const c = makeCategory({ name: 'orig' });
        await repo.upsertCategory(c);
        c.name = 'changed';
        const got = await repo.getCategoryById('cat-1');
        expect(got?.name).toBe('orig');
    });
});
