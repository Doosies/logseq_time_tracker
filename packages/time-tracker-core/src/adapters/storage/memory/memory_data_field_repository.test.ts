import { describe, expect, it } from 'vitest';

import type { DataField } from '../../../types/meta';
import { MemoryDataFieldRepository } from './memory_data_field_repository';

function makeDataField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'df-1',
        entity_type_id: 'job',
        data_type: 'string',
        key: 'k',
        label: 'L',
        view_type: 'default',
        is_required: false,
        is_system: false,
        default_value: '',
        options: '',
        relation_entity_key: '',
        sort_order: 0,
        created_at: '2025-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('MemoryDataFieldRepository', () => {
    it('UC-MEM-024: upsert와 getDataFieldById로 삽입·갱신이 반영된다', async () => {
        const repo = new MemoryDataFieldRepository();
        const field = makeDataField({ id: 'f1', label: '첫' });
        await repo.upsertDataField(field);
        expect((await repo.getDataFieldById('f1'))?.label).toBe('첫');
        await repo.upsertDataField({ ...field, label: '둘' });
        expect((await repo.getDataFieldById('f1'))?.label).toBe('둘');
    });

    it('UC-MEM-025: getDataFields는 entity_type_id로 필터하고 sort_order로 정렬한다', async () => {
        const repo = new MemoryDataFieldRepository();
        await repo.upsertDataField(makeDataField({ id: 'a', entity_type_id: 'job', sort_order: 10, key: 'a' }));
        await repo.upsertDataField(makeDataField({ id: 'b', entity_type_id: 'job', sort_order: 1, key: 'b' }));
        await repo.upsertDataField(makeDataField({ id: 'c', entity_type_id: 'other', sort_order: 0, key: 'c' }));
        const list = await repo.getDataFields('job');
        expect(list.map((f) => f.id)).toEqual(['b', 'a']);
    });

    it('UC-MEM-026: deleteDataField 후 getDataFieldById는 null이다', async () => {
        const repo = new MemoryDataFieldRepository();
        await repo.upsertDataField(makeDataField({ id: 'gone' }));
        await repo.deleteDataField('gone');
        expect(await repo.getDataFieldById('gone')).toBeNull();
    });

    it('UC-MEM-027: structuredClone 격리 — upsert 후 원본 변경해도 저장값은 불변', async () => {
        const repo = new MemoryDataFieldRepository();
        const field = makeDataField({ id: 'f1', label: '원본' });
        await repo.upsertDataField(field);
        field.label = '변경';
        expect((await repo.getDataFieldById('f1'))?.label).toBe('원본');
    });
});
