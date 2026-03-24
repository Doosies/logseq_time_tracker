import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { CATEGORY_MAX_DEPTH } from '../constants/config';
import { ValidationError } from '../errors';
import { CategoryService } from './category_service';

describe('CategoryService', () => {
    let uow: MemoryUnitOfWork;
    let category_service: CategoryService;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
        category_service = new CategoryService(uow);
    });

    it('createCategory: 생성 확인', async () => {
        const c = await category_service.createCategory('  작업  ');
        expect(c.name).toBe('작업');
        expect(c.parent_id).toBeNull();
    });

    it('createCategory: 빈 이름 시 ValidationError', async () => {
        await expect(category_service.createCategory('   ')).rejects.toThrow(ValidationError);
    });

    it('createCategory: 동일 부모 내 중복 이름 시 ValidationError', async () => {
        await category_service.createCategory('dup');
        await expect(category_service.createCategory('dup')).rejects.toThrow(ValidationError);
    });

    it('createCategory: 부모 존재하지 않으면 ValidationError', async () => {
        await expect(category_service.createCategory('x', 'no-such-parent')).rejects.toThrow(ValidationError);
    });

    it('createCategory: 트리 깊이 초과 시 ValidationError', async () => {
        let parent_id: string | undefined;
        for (let i = 0; i < CATEGORY_MAX_DEPTH; i++) {
            const c = await category_service.createCategory(`level-${i}`, parent_id);
            parent_id = c.id;
        }
        await expect(category_service.createCategory('too-deep', parent_id)).rejects.toThrow(ValidationError);
    });

    it('seedDefaults: 기본 4개 카테고리 생성', async () => {
        await category_service.seedDefaults();
        const all = await category_service.getCategories();
        expect(all).toHaveLength(4);
        const names = all.map((c) => c.name).sort();
        expect(names).toEqual(['개발', '기타', '분석', '회의'].sort());
    });

    it('seedDefaults: 멱등 — 이미 있으면 스킵', async () => {
        await category_service.seedDefaults();
        await category_service.seedDefaults();
        const all = await category_service.getCategories();
        expect(all).toHaveLength(4);
    });

    it('getCategoryTree: 트리 구조 반환', async () => {
        await category_service.seedDefaults();
        const tree = await category_service.getCategoryTree();
        expect(tree.length).toBe(4);
        expect(tree.every((n) => n.children.length === 0)).toBe(true);
    });

    it('updateCategory: 이름 변경', async () => {
        const c = await category_service.createCategory('old');
        const u = await category_service.updateCategory(c.id, { name: 'new' });
        expect(u.name).toBe('new');
    });

    it('deleteCategory: 삭제 확인', async () => {
        const c = await category_service.createCategory('gone');
        await category_service.deleteCategory(c.id);
        expect(await uow.categoryRepo.getCategoryById(c.id)).toBeNull();
    });

    it('deleteCategory: 자식 있으면 ValidationError', async () => {
        const parent = await category_service.createCategory('p');
        await category_service.createCategory('child', parent.id);
        await expect(category_service.deleteCategory(parent.id)).rejects.toThrow(ValidationError);
    });
});
