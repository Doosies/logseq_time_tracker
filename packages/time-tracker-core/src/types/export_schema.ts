import { z } from 'zod';
import type { ExportData } from './export';
import { ValidationError } from '../errors';

const DATA_TYPE_KEYS = ['string', 'decimal', 'date', 'datetime', 'boolean', 'enum', 'relation'] as const;

const STATUS_VALUES = ['pending', 'in_progress', 'paused', 'completed', 'cancelled'] as const;

const status_kind_schema = z.enum(STATUS_VALUES);

const job_schema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    status: status_kind_schema,
    custom_fields: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

const category_schema = z.object({
    id: z.string(),
    name: z.string(),
    parent_id: z.union([z.string(), z.null()]),
    is_active: z.boolean(),
    sort_order: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
});

const time_entry_schema = z.object({
    id: z.string(),
    job_id: z.string(),
    category_id: z.string(),
    started_at: z.string(),
    ended_at: z.string(),
    duration_seconds: z.number(),
    note: z.string(),
    is_manual: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
});

const job_history_schema = z.object({
    id: z.string(),
    job_id: z.string(),
    from_status: z.union([status_kind_schema, z.null()]),
    to_status: status_kind_schema,
    reason: z.string(),
    occurred_at: z.string(),
    created_at: z.string(),
});

const external_ref_schema = z.object({
    id: z.string(),
    job_id: z.string(),
    system_key: z.string(),
    ref_value: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

const job_category_schema = z.object({
    id: z.string(),
    job_id: z.string(),
    category_id: z.string(),
    is_default: z.boolean(),
    created_at: z.string(),
});

const job_template_schema = z.object({
    id: z.string(),
    name: z.string(),
    content: z.string(),
    placeholders: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
});

const data_type_key_schema = z.enum(DATA_TYPE_KEYS);

const data_field_schema = z.object({
    id: z.string(),
    entity_type_id: z.string(),
    data_type: data_type_key_schema,
    key: z.string(),
    label: z.string(),
    view_type: z.string(),
    is_required: z.boolean(),
    is_system: z.boolean(),
    default_value: z.string(),
    options: z.string(),
    relation_entity_key: z.string(),
    sort_order: z.number(),
    created_at: z.string(),
});

export const export_data_schema = z.object({
    version: z.string(),
    exported_at: z.string(),
    data: z.object({
        jobs: z.array(job_schema),
        categories: z.array(category_schema),
        time_entries: z.array(time_entry_schema),
        job_history: z.array(job_history_schema),
        job_categories: z.array(job_category_schema),
        job_templates: z.array(job_template_schema),
        external_refs: z.array(external_ref_schema),
        data_fields: z.array(data_field_schema).optional(),
        settings: z.record(z.string(), z.unknown()),
    }),
});

export function validateExportData(raw: unknown): ExportData {
    const result = export_data_schema.safeParse(raw);
    if (!result.success) {
        const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        throw new ValidationError(`Invalid export data: ${issues}`, 'data');
    }
    const { version, exported_at, data } = result.data;
    return {
        version,
        exported_at,
        data: {
            ...data,
            data_fields: data.data_fields ?? [],
        },
    };
}
