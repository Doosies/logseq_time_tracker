import { describe, expect, it } from 'vitest';

import type { DataField, DataTypeKey } from '../../types/meta';
import BooleanField from './components/boolean_field.svelte';
import DateFieldComponent from './components/date_field.svelte';
import DatetimeField from './components/datetime_field.svelte';
import DecimalField from './components/decimal_field.svelte';
import EnumField from './components/enum_field.svelte';
import RelationField from './components/relation_field.svelte';
import StringField from './components/string_field.svelte';
import { resolveFieldComponent } from './field_component_registry';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'string',
        key: 'test',
        label: 'Test',
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

describe('resolveFieldComponent', () => {
    it('UC-FIELD-001: 각 DataTypeKey에 맞는 기본 컴포넌트를 반환한다', () => {
        const cases: Array<{ data_type: DataTypeKey; expected: unknown }> = [
            { data_type: 'string', expected: StringField },
            { data_type: 'decimal', expected: DecimalField },
            { data_type: 'date', expected: DateFieldComponent },
            { data_type: 'datetime', expected: DatetimeField },
            { data_type: 'boolean', expected: BooleanField },
            { data_type: 'enum', expected: EnumField },
            { data_type: 'relation', expected: RelationField },
        ];
        for (const { data_type, expected } of cases) {
            expect(resolveFieldComponent(makeField({ data_type }))).toBe(expected);
        }
    });

    it('UC-FIELD-002: 알 수 없는 data_type이면 StringField로 폴백한다', () => {
        const field = makeField({
            data_type: 'unknown_type' as DataTypeKey,
        });
        expect(resolveFieldComponent(field)).toBe(StringField);
    });

    it("UC-FIELD-003: view_type이 'default'이면 DEFAULT_BY_DATA_TYPE 경로를 사용한다", () => {
        expect(resolveFieldComponent(makeField({ data_type: 'decimal', view_type: 'default' }))).toBe(DecimalField);
    });

    it('UC-FIELD-004: view_type이 비어 있으면 기본 컴포넌트를 사용한다', () => {
        expect(resolveFieldComponent(makeField({ data_type: 'enum', view_type: '' }))).toBe(EnumField);
    });
});
