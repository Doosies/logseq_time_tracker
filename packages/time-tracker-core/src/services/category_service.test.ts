import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { CATEGORY_MAX_DEPTH } from '../constants/config';
import { ReferenceIntegrityError, ValidationError } from '../errors';
import type { TimeEntry } from '../types/time_entry';
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

    it('UC-CAT-002: createCategory: 트리 깊이 초과 시 ValidationError', async () => {
        let parent_id: string | undefined;
        for (let i = 0; i < CATEGORY_MAX_DEPTH; i++) {
            const c = await category_service.createCategory(`level-${i}`, parent_id);
            parent_id = c.id;
        }
        await expect(category_service.createCategory('too-deep', parent_id)).rejects.toThrow(ValidationError);
    });

    it('UC-EDGE-003: 최대 깊이(CATEGORY_MAX_DEPTH=10) 성공 + 초과 시 거부', async () => {
        let parent_id: string | undefined;
        for (let i = 0; i < CATEGORY_MAX_DEPTH; i++) {
            const c = await category_service.createCategory(`depth-${i}`, parent_id);
            parent_id = c.id;
            expect(c).toBeDefined();
        }
        const last = await uow.categoryRepo.getCategoryById(parent_id!);
        expect(last).not.toBeNull();

        await expect(category_service.createCategory('overflow', parent_id)).rejects.toThrow(ValidationError);
    });

    it('UC-CAT-001: seedDefaults: 기본 4개 카테고리 생성', async () => {
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

    it('UC-CAT-003: is_active=false 설정 후 활성 필터 적용 시 제외', async () => {
        const c = await category_service.createCategory('active-then-off');
        const full_before = await category_service.getCategories();
        expect(full_before.some((x) => x.id === c.id && x.is_active)).toBe(true);

        // CategoryService.updateCategory는 is_active를 받지 않음 — 저장소에 직접 반영
        const patched = { ...c, is_active: false, updated_at: new Date().toISOString() };
        await uow.categoryRepo.upsertCategory(patched);

        const all = await category_service.getCategories();
        expect(all.find((x) => x.id === c.id)?.is_active).toBe(false);
        // getCategories()는 비활성까지 반환; 소비자 측 활성 필터로 제외됨
        const active_only = all.filter((x) => x.is_active);
        expect(active_only.some((x) => x.id === c.id)).toBe(false);
    });

    it('UC-CAT-004: updateCategory: sort_order 변경 후 정렬 순서 검증', async () => {
        await category_service.createCategory('sort-a');
        const second = await category_service.createCategory('sort-b');
        await category_service.updateCategory(second.id, { sort_order: 0 });
        const tree = await category_service.getCategoryTree();
        const root_names = tree.map((n) => n.category.name);
        expect(root_names.indexOf('sort-b')).toBeLessThan(root_names.indexOf('sort-a'));
    });

    it('UC-STORE-005: deleteCategory: TimeEntry 참조 시 에러', async () => {
        const cat = await category_service.createCategory('refd');
        const now = '2025-06-01T12:00:00.000Z';
        const entry: TimeEntry = {
            id: 'e-cat-ref',
            job_id: 'job-1',
            category_id: cat.id,
            started_at: '2025-06-01T10:00:00.000Z',
            ended_at: now,
            duration_seconds: 100,
            note: '',
            is_manual: false,
            created_at: now,
            updated_at: now,
        };
        await uow.timeEntryRepo.upsertTimeEntry(entry);
        await expect(category_service.deleteCategory(cat.id)).rejects.toThrow(ReferenceIntegrityError);
    });

    it('UC-CATEGORY-CYCLE-001: 부모 체인 순환 시 createCategory에서 ValidationError', async () => {
        const a = await category_service.createCategory('cycle-a');
        const b = await category_service.createCategory('cycle-b', a.id);
        const c = await category_service.createCategory('cycle-c', b.id);
        const a_full = await uow.categoryRepo.getCategoryById(a.id);
        expect(a_full).not.toBeNull();
        await uow.categoryRepo.upsertCategory({
            ...a_full!,
            parent_id: c.id,
            updated_at: new Date().toISOString(),
        });
        await expect(category_service.createCategory('breaks', b.id)).rejects.toThrow(ValidationError);
    });
});
