import type { DataField } from '../../../types/meta';
import type { IDataFieldRepository } from '../repositories';

export class MemoryDataFieldRepository implements IDataFieldRepository {
    private readonly _fields = new Map<string, DataField>();

    getSnapshot(): Map<string, DataField> {
        const snapshot = new Map<string, DataField>();
        for (const [id, f] of this._fields) {
            snapshot.set(id, structuredClone(f));
        }
        return snapshot;
    }

    restoreFromSnapshot(data: Map<string, DataField>): void {
        this._fields.clear();
        for (const [id, f] of data) {
            this._fields.set(id, structuredClone(f));
        }
    }

    async getDataFields(entity_type_id: string): Promise<DataField[]> {
        const list = Array.from(this._fields.values(), (f) => structuredClone(f)).filter(
            (f) => f.entity_type_id === entity_type_id,
        );
        list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        return list;
    }

    async getDataFieldById(id: string): Promise<DataField | null> {
        const f = this._fields.get(id);
        return f ? structuredClone(f) : null;
    }

    async upsertDataField(field: DataField): Promise<void> {
        this._fields.set(field.id, structuredClone(field));
    }

    async deleteDataField(id: string): Promise<void> {
        this._fields.delete(id);
    }
}
