import type { DataTypeKey } from '../types/meta';

/** 마이그레이션 003 시드와 일치하는 entity_type.id 목록 */
export const SEEDED_ENTITY_TYPE_IDS = [
    'et-job',
    'et-category',
    'et-time-entry',
    'et-job-history',
    'et-job-template',
] as const;

/** 마이그레이션 003 시드와 일치하는 data_type.key 목록 */
export const SEEDED_DATA_TYPE_KEYS: readonly DataTypeKey[] = [
    'string',
    'decimal',
    'date',
    'datetime',
    'boolean',
    'enum',
    'relation',
] as const;

/** data_type별 허용 view_type */
export const VIEW_TYPES_BY_DATA_TYPE: Record<DataTypeKey, readonly string[]> = {
    string: ['default', 'text', 'textarea', 'url', 'email'],
    decimal: ['default', 'decimal', 'slider', 'currency'],
    date: ['default', 'date_picker', 'calendar'],
    datetime: ['default', 'datetime_picker'],
    boolean: ['default', 'toggle', 'checkbox'],
    enum: ['default', 'select', 'radio', 'chip'],
    relation: ['default', 'entity_selector', 'inline_card'],
};
