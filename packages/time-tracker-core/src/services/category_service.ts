import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import type { Category } from '../types/category';
import { ValidationError } from '../errors';
import { sanitizeText, generateId } from '../utils';
import { MAX_CATEGORY_NAME_LENGTH, CATEGORY_MAX_DEPTH } from '../constants/config';

export interface ICategoryService {
    getCategories(): Promise<Category[]>;
    getCategoryTree(): Promise<CategoryTreeNode[]>;
    createCategory(name: string, parent_id?: string): Promise<Category>;
    updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'sort_order'>>): Promise<Category>;
    deleteCategory(id: string): Promise<void>;
    seedDefaults(): Promise<void>;
}

export interface CategoryTreeNode {
    category: Category;
    children: CategoryTreeNode[];
}

function normalizeParentId(parent_id: string | undefined): string | null {
    return parent_id === undefined ? null : parent_id;
}

function computeDepthFromParent(category_id: string, by_id: Map<string, Category>, visited: Set<string>): number {
    if (visited.has(category_id)) {
        throw new ValidationError('Category parent chain contains a cycle', 'parent_id');
    }
    visited.add(category_id);
    const current = by_id.get(category_id);
    if (!current) {
        return 0;
    }
    if (current.parent_id === null) {
        return 1;
    }
    return 1 + computeDepthFromParent(current.parent_id, by_id, visited);
}

function buildCategoryTreeNodes(categories: Category[], parent_id: string | null): CategoryTreeNode[] {
    return categories
        .filter((c) => (c.parent_id ?? null) === (parent_id ?? null))
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => ({
            category: c,
            children: buildCategoryTreeNodes(categories, c.id),
        }));
}

export class CategoryService implements ICategoryService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _logger?: ILogger,
    ) {}

    async getCategories(): Promise<Category[]> {
        return this._uow.categoryRepo.getCategories();
    }

    async getCategoryTree(): Promise<CategoryTreeNode[]> {
        const categories = await this._uow.categoryRepo.getCategories();
        return buildCategoryTreeNodes(categories, null);
    }

    async createCategory(name: string, parent_id?: string): Promise<Category> {
        const name_clean = sanitizeText(name, MAX_CATEGORY_NAME_LENGTH);
        if (name_clean.length === 0) {
            throw new ValidationError('Category name cannot be empty', 'name');
        }
        const parent_key = normalizeParentId(parent_id);
        const all = await this._uow.categoryRepo.getCategories();
        const by_id = new Map(all.map((c) => [c.id, c]));

        if (parent_key !== null) {
            const parent = by_id.get(parent_key);
            if (!parent) {
                throw new ValidationError(`Parent category not found: ${parent_key}`, 'parent_id');
            }
            const visited = new Set<string>();
            const parent_depth = computeDepthFromParent(parent_key, by_id, visited);
            if (parent_depth + 1 > CATEGORY_MAX_DEPTH) {
                throw new ValidationError(`Category depth cannot exceed ${CATEGORY_MAX_DEPTH}`, 'parent_id');
            }
        }

        const duplicate = all.some((c) => (c.parent_id ?? null) === (parent_key ?? null) && c.name === name_clean);
        if (duplicate) {
            throw new ValidationError('A category with this name already exists under the parent', 'name');
        }

        const sibling_count = all.filter((c) => (c.parent_id ?? null) === (parent_key ?? null)).length;
        const sort_order = sibling_count + 1;
        const now = new Date().toISOString();
        const category: Category = {
            id: generateId(),
            name: name_clean,
            parent_id: parent_key,
            is_active: true,
            sort_order,
            created_at: now,
            updated_at: now,
        };
        await this._uow.categoryRepo.upsertCategory(category);
        this._logger?.debug('Category created', { id: category.id });
        return category;
    }

    async updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'sort_order'>>): Promise<Category> {
        const existing = await this._uow.categoryRepo.getCategoryById(id);
        if (!existing) {
            throw new ValidationError(`Category not found: ${id}`, 'id');
        }
        let name = existing.name;
        if (updates.name !== undefined) {
            name = sanitizeText(updates.name, MAX_CATEGORY_NAME_LENGTH);
            if (name.length === 0) {
                throw new ValidationError('Category name cannot be empty', 'name');
            }
        }
        const sort_order = updates.sort_order ?? existing.sort_order;
        const all = await this._uow.categoryRepo.getCategories();
        const parent_key = existing.parent_id ?? null;
        if (updates.name !== undefined) {
            const name_conflict = all.some(
                (c) => c.id !== id && (c.parent_id ?? null) === (parent_key ?? null) && c.name === name,
            );
            if (name_conflict) {
                throw new ValidationError('A category with this name already exists under the parent', 'name');
            }
        }
        const now = new Date().toISOString();
        const category: Category = {
            ...existing,
            name,
            sort_order,
            updated_at: now,
        };
        await this._uow.categoryRepo.upsertCategory(category);
        return category;
    }

    async deleteCategory(id: string): Promise<void> {
        const existing = await this._uow.categoryRepo.getCategoryById(id);
        if (!existing) {
            throw new ValidationError(`Category not found: ${id}`, 'id');
        }
        const all = await this._uow.categoryRepo.getCategories();
        const has_children = all.some((c) => c.parent_id === id);
        if (has_children) {
            throw new ValidationError('Cannot delete a category that has child categories', 'id');
        }
        await this._uow.categoryRepo.deleteCategory(id);
        this._logger?.debug('Category deleted', { id });
    }

    async seedDefaults(): Promise<void> {
        const existing = await this._uow.categoryRepo.getCategories();
        if (existing.length > 0) {
            return;
        }
        const now = new Date().toISOString();
        const defaults = ['개발', '분석', '회의', '기타'];
        let sort_order = 1;
        for (const name of defaults) {
            const category: Category = {
                id: generateId(),
                name,
                parent_id: null,
                is_active: true,
                sort_order,
                created_at: now,
                updated_at: now,
            };
            sort_order += 1;
            await this._uow.categoryRepo.upsertCategory(category);
        }
        this._logger?.info('Default categories seeded', { count: defaults.length });
    }
}
