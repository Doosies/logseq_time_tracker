import type { Component } from 'svelte';

import type { DataField, DataTypeKey } from '../../types/meta';

import BooleanField from './components/boolean_field.svelte';
import DateFieldComponent from './components/date_field.svelte';
import DatetimeField from './components/datetime_field.svelte';
import DecimalField from './components/decimal_field.svelte';
import EnumField from './components/enum_field.svelte';
import RelationField from './components/relation_field.svelte';
import StringField from './components/string_field.svelte';

/** Widened for exactOptionalPropertyTypes: concrete field components differ slightly on props. */
type FieldComponentEntry = Component<Record<string, unknown>>;

const DEFAULT_BY_DATA_TYPE: Record<DataTypeKey, FieldComponentEntry> = {
    string: StringField as FieldComponentEntry,
    decimal: DecimalField as FieldComponentEntry,
    date: DateFieldComponent as FieldComponentEntry,
    datetime: DatetimeField as FieldComponentEntry,
    boolean: BooleanField as FieldComponentEntry,
    enum: EnumField as FieldComponentEntry,
    relation: RelationField as FieldComponentEntry,
};

/** Override registry for non-default view_types (MVP: same components handle modes internally). */
const OVERRIDE_REGISTRY: Partial<Record<string, FieldComponentEntry>> = {};

export function resolveFieldComponent(field: DataField): FieldComponentEntry {
    const { data_type, view_type } = field;
    if (view_type && view_type !== 'default') {
        const registry_key = `${data_type}:${view_type}`;
        const override = OVERRIDE_REGISTRY[registry_key];
        if (override) {
            return override;
        }
    }
    return DEFAULT_BY_DATA_TYPE[data_type] ?? StringField;
}
