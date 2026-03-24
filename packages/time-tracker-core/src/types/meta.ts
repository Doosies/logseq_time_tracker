export type DataTypeKey = 'string' | 'decimal' | 'date' | 'datetime' | 'boolean' | 'enum' | 'relation';

export interface DataType {
    id: string;
    key: DataTypeKey;
    label: string;
    description: string;
    created_at: string;
}

export interface EntityType {
    id: string;
    key: string;
    label: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface DataField {
    id: string;
    entity_type_id: string;
    data_type: DataTypeKey;
    key: string;
    label: string;
    view_type: string;
    is_required: boolean;
    is_system: boolean;
    default_value: string;
    options: string;
    relation_entity_key: string;
    sort_order: number;
    created_at: string;
}
