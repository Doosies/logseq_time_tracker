import type { Category } from '../../../types/category';
import type { ICategoryRepository } from '../repositories';

export class MemoryCategoryRepository implements ICategoryRepository {
    private readonly categories = new Map<string, Category>();

    getSnapshot(): Map<string, Category> {
        const snapshot = new Map<string, Category>();
        for (const [id, c] of this.categories) {
            snapshot.set(id, structuredClone(c));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, Category>): void {
        this.categories.clear();
        for (const [id, c] of data) {
            this.categories.set(id, structuredClone(c));
        }
    }

    async getCategories(): Promise<Category[]> {
        return Array.from(this.categories.values(), (c) => structuredClone(c));
    }

    async getCategoryById(id: string): Promise<Category | null> {
        const c = this.categories.get(id);
        return c ? structuredClone(c) : null;
    }

    async upsertCategory(category: Category): Promise<void> {
        this.categories.set(category.id, structuredClone(category));
    }

    async deleteCategory(id: string): Promise<void> {
        this.categories.delete(id);
    }
}
