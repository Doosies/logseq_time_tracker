export interface JobTemplate {
    id: string;
    name: string;
    content: string;
    placeholders: string;
    created_at: string;
    updated_at: string;
}

export interface PlaceholderDef {
    id: string;
    key: string;
    label: string;
    field_ref?: string;
}
