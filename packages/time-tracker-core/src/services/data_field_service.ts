import type { ILogger } from '../adapters/logger';
import type { IUnitOfWork } from '../adapters/storage/unit_of_work';
import { MAX_DATA_FIELD_KEY_LENGTH, MAX_DATA_FIELD_LABEL_LENGTH, MAX_DESCRIPTION_LENGTH } from '../constants/config';
import { SEEDED_DATA_TYPE_KEYS, SEEDED_ENTITY_TYPE_IDS, VIEW_TYPES_BY_DATA_TYPE } from '../constants/data_field_meta';
import { ValidationError } from '../errors';
import type { DataField, DataTypeKey } from '../types/meta';
import { generateId, sanitizeText } from '../utils';

const SEEDED_ENTITY_SET = new Set<string>(SEEDED_ENTITY_TYPE_IDS);
const SEEDED_DATA_TYPE_SET = new Set<string>(SEEDED_DATA_TYPE_KEYS);

export interface CreateDataFieldParams {
    entity_type_id: string;
    data_type: DataTypeKey;
    key: string;
    label: string;
    view_type?: string;
    is_required?: boolean;
    default_value?: string;
    options?: string;
    relation_entity_key?: string;
    sort_order?: number;
}

export interface UpdateDataFieldParams {
    label?: string;
    sort_order?: number;
    view_type?: string;
    key?: string;
    is_required?: boolean;
    default_value?: string;
    options?: string;
    relation_entity_key?: string;
    data_type?: DataTypeKey;
}

const SYSTEM_FIELD_UPDATE_KEYS = new Set(['label', 'sort_order', 'view_type']);

export class DataFieldService {
    constructor(
        private readonly _uow: IUnitOfWork,
        private readonly _logger?: ILogger,
    ) {}

    async createField(params: CreateDataFieldParams): Promise<DataField> {
        return this._uow.transaction(async (uow) => {
            if (!SEEDED_ENTITY_SET.has(params.entity_type_id)) {
                throw new ValidationError(`알 수 없는 entity_type_id: ${params.entity_type_id}`, 'entity_type_id');
            }
            if (!SEEDED_DATA_TYPE_SET.has(params.data_type)) {
                throw new ValidationError(`알 수 없는 data_type: ${params.data_type}`, 'data_type');
            }

            const key_clean = sanitizeText(params.key, MAX_DATA_FIELD_KEY_LENGTH).trim();
            if (key_clean.length === 0) {
                throw new ValidationError('필드 key는 비울 수 없습니다', 'key');
            }

            const label_clean = sanitizeText(params.label, MAX_DATA_FIELD_LABEL_LENGTH);
            const view_type = params.view_type ?? 'default';
            this.assertViewTypeAllowed(params.data_type, view_type);

            const existing_list = await uow.dataFieldRepo.getDataFields(params.entity_type_id);
            if (existing_list.some((f) => f.key === key_clean)) {
                throw new ValidationError(`동일 엔티티에 key가 이미 있습니다: ${key_clean}`, 'key');
            }

            if (params.data_type === 'enum') {
                const options_raw = params.options ?? '';
                const options_clean = sanitizeText(options_raw, MAX_DESCRIPTION_LENGTH).trim();
                if (options_clean.length === 0) {
                    throw new ValidationError('enum 타입은 options가 필요합니다', 'options');
                }
            }

            if (params.data_type === 'relation') {
                const rel = (params.relation_entity_key ?? '').trim();
                if (rel.length === 0) {
                    throw new ValidationError(
                        'relation 타입은 relation_entity_key가 필요합니다',
                        'relation_entity_key',
                    );
                }
            }

            const default_value_clean =
                params.default_value !== undefined ? sanitizeText(params.default_value, MAX_DESCRIPTION_LENGTH) : '';
            const options_clean =
                params.options !== undefined ? sanitizeText(params.options, MAX_DESCRIPTION_LENGTH) : '';
            const relation_key_clean =
                params.relation_entity_key !== undefined
                    ? sanitizeText(params.relation_entity_key, MAX_DATA_FIELD_KEY_LENGTH).trim()
                    : '';

            const created_at = new Date().toISOString();
            const field: DataField = {
                id: generateId(),
                entity_type_id: params.entity_type_id,
                data_type: params.data_type,
                key: key_clean,
                label: label_clean,
                view_type,
                is_required: params.is_required ?? false,
                is_system: false,
                default_value: default_value_clean,
                options: options_clean,
                relation_entity_key: relation_key_clean,
                sort_order: params.sort_order ?? 0,
                created_at,
            };

            await uow.dataFieldRepo.upsertDataField(field);
            this._logger?.debug('Data field created', {
                id: field.id,
                entity_type_id: field.entity_type_id,
                key: field.key,
            });
            return field;
        });
    }

    async updateField(id: string, updates: UpdateDataFieldParams): Promise<DataField> {
        return this._uow.transaction(async (uow) => {
            const existing = await uow.dataFieldRepo.getDataFieldById(id);
            if (!existing) {
                throw new ValidationError(`필드를 찾을 수 없습니다: ${id}`, 'id');
            }

            if (existing.is_system) {
                for (const k of Object.keys(updates) as (keyof UpdateDataFieldParams)[]) {
                    if (updates[k] === undefined) {
                        continue;
                    }
                    if (!SYSTEM_FIELD_UPDATE_KEYS.has(k)) {
                        throw new ValidationError('시스템 필드는 label, sort_order, view_type만 변경할 수 있습니다', k);
                    }
                }
            }

            let next_data_type = existing.data_type;
            if (updates.data_type !== undefined) {
                if (!SEEDED_DATA_TYPE_SET.has(updates.data_type)) {
                    throw new ValidationError(`알 수 없는 data_type: ${updates.data_type}`, 'data_type');
                }
                next_data_type = updates.data_type;
            }

            let next_key = existing.key;
            if (updates.key !== undefined) {
                const key_clean = sanitizeText(updates.key, MAX_DATA_FIELD_KEY_LENGTH).trim();
                if (key_clean.length === 0) {
                    throw new ValidationError('필드 key는 비울 수 없습니다', 'key');
                }
                next_key = key_clean;
            }

            let next_label = existing.label;
            if (updates.label !== undefined) {
                next_label = sanitizeText(updates.label, MAX_DATA_FIELD_LABEL_LENGTH);
            }

            let next_view = updates.view_type !== undefined ? updates.view_type : existing.view_type;
            if (updates.view_type === undefined && updates.data_type !== undefined) {
                next_view = existing.view_type;
            }
            this.assertViewTypeAllowed(next_data_type, next_view);

            let next_options = existing.options;
            if (updates.options !== undefined) {
                next_options = sanitizeText(updates.options, MAX_DESCRIPTION_LENGTH);
            }

            let next_default = existing.default_value;
            if (updates.default_value !== undefined) {
                next_default = sanitizeText(updates.default_value, MAX_DESCRIPTION_LENGTH);
            }

            let next_relation = existing.relation_entity_key;
            if (updates.relation_entity_key !== undefined) {
                next_relation = sanitizeText(updates.relation_entity_key, MAX_DATA_FIELD_KEY_LENGTH).trim();
            }

            if (next_data_type === 'enum' && next_options.trim().length === 0) {
                throw new ValidationError('enum 타입은 options가 필요합니다', 'options');
            }

            if (next_data_type === 'relation' && next_relation.length === 0) {
                throw new ValidationError('relation 타입은 relation_entity_key가 필요합니다', 'relation_entity_key');
            }

            if (next_key !== existing.key) {
                const siblings = await uow.dataFieldRepo.getDataFields(existing.entity_type_id);
                const dup = siblings.some((f) => f.id !== id && f.key === next_key);
                if (dup) {
                    throw new ValidationError(`동일 엔티티에 key가 이미 있습니다: ${next_key}`, 'key');
                }
            }

            const merged: DataField = {
                ...existing,
                data_type: next_data_type,
                key: next_key,
                label: next_label,
                view_type: next_view,
                is_required: updates.is_required !== undefined ? updates.is_required : existing.is_required,
                default_value: next_default,
                options: next_options,
                relation_entity_key: next_relation,
                sort_order: updates.sort_order !== undefined ? updates.sort_order : existing.sort_order,
            };

            await uow.dataFieldRepo.upsertDataField(merged);
            this._logger?.debug('Data field updated', { id: merged.id });
            return merged;
        });
    }

    async deleteField(id: string): Promise<void> {
        const existing = await this._uow.dataFieldRepo.getDataFieldById(id);
        if (!existing) {
            throw new ValidationError(`필드를 찾을 수 없습니다: ${id}`, 'id');
        }
        if (existing.is_system) {
            throw new ValidationError('시스템 필드는 삭제할 수 없습니다', 'id');
        }
        await this._uow.dataFieldRepo.deleteDataField(id);
        this._logger?.debug('Data field deleted', { id });
    }

    async getFieldsByEntity(entity_type_id: string): Promise<DataField[]> {
        return this._uow.dataFieldRepo.getDataFields(entity_type_id);
    }

    private assertViewTypeAllowed(data_type: DataTypeKey, view_type: string): void {
        const allowed = VIEW_TYPES_BY_DATA_TYPE[data_type];
        if (!allowed.includes(view_type)) {
            throw new ValidationError(`data_type ${data_type}에 허용되지 않는 view_type: ${view_type}`, 'view_type');
        }
    }
}
