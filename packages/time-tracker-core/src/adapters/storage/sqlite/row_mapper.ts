import type { Database } from 'sql.js';
import type { Category } from '../../../types/category';
import type { DataField, DataTypeKey } from '../../../types/meta';
import type { ExternalRef } from '../../../types/external_ref';
import type { JobHistory } from '../../../types/history';
import type { JobCategory } from '../../../types/job_category';
import type { Job } from '../../../types/job';
import type { StatusKind } from '../../../types/job_status';
import type { JobTemplate } from '../../../types/template';
import type { TimeEntry } from '../../../types/time_entry';

/** sql.js `exec` 결과를 행 객체 배열로 변환합니다. */
export function mapExecResult(result: { columns: string[]; values: unknown[][] }[]): Record<string, unknown>[] {
    const first = result[0];
    if (first === undefined) {
        return [];
    }
    const { columns, values } = first;
    if (values === undefined || values.length === 0) {
        return [];
    }
    return values.map((row: unknown[]) => {
        const obj: Record<string, unknown> = {};
        columns.forEach((col: string, i: number) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

/** 단일 SELECT용: `exec`로 조회한 레코드 배열을 반환합니다. */
export function execToRecords(
    db: Database,
    sql: string,
    params?: (string | number | Uint8Array | null)[],
): Record<string, unknown>[] {
    const bind = params === undefined || params.length === 0 ? undefined : params;
    return mapExecResult(db.exec(sql, bind));
}

/** SQLite INTEGER(0/1) → boolean */
export function toBool(val: unknown): boolean {
    return Number(val) !== 0;
}

function strOrEmpty(val: unknown): string {
    if (val === null || val === undefined) {
        return '';
    }
    return String(val);
}

function asStatusKind(val: unknown): StatusKind {
    return String(val ?? '') as StatusKind;
}

function asDataTypeKey(val: unknown): DataTypeKey {
    return String(val ?? '') as DataTypeKey;
}

export function mapRowToJob(row: Record<string, unknown>): Job {
    return {
        id: strOrEmpty(row['id']),
        title: strOrEmpty(row['title']),
        description: strOrEmpty(row['description']),
        status: asStatusKind(row['status']),
        custom_fields: strOrEmpty(row['custom_fields']),
        created_at: strOrEmpty(row['created_at']),
        updated_at: strOrEmpty(row['updated_at']),
    };
}

export function mapRowToCategory(row: Record<string, unknown>): Category {
    const parent_raw = row['parent_id'];
    return {
        id: strOrEmpty(row['id']),
        name: strOrEmpty(row['name']),
        parent_id: parent_raw === null || parent_raw === undefined ? null : String(parent_raw),
        is_active: toBool(row['is_active']),
        sort_order: row['sort_order'] === null || row['sort_order'] === undefined ? 0 : Number(row['sort_order']),
        created_at: strOrEmpty(row['created_at']),
        updated_at: strOrEmpty(row['updated_at']),
    };
}

export function mapRowToTimeEntry(row: Record<string, unknown>): TimeEntry {
    return {
        id: strOrEmpty(row['id']),
        job_id: strOrEmpty(row['job_id']),
        category_id: strOrEmpty(row['category_id']),
        started_at: strOrEmpty(row['started_at']),
        ended_at: strOrEmpty(row['ended_at']),
        duration_seconds: Number(row['duration_seconds'] ?? 0),
        note: strOrEmpty(row['note']),
        is_manual: toBool(row['is_manual']),
        created_at: strOrEmpty(row['created_at']),
        updated_at: strOrEmpty(row['updated_at']),
    };
}

export function mapRowToJobHistory(row: Record<string, unknown>): JobHistory {
    const from_raw = row['from_status'];
    return {
        id: strOrEmpty(row['id']),
        job_id: strOrEmpty(row['job_id']),
        from_status: from_raw === null || from_raw === undefined || from_raw === '' ? null : asStatusKind(from_raw),
        to_status: asStatusKind(row['to_status']),
        reason: strOrEmpty(row['reason']),
        occurred_at: strOrEmpty(row['occurred_at']),
        created_at: strOrEmpty(row['created_at']),
    };
}

export function mapRowToExternalRef(row: Record<string, unknown>): ExternalRef {
    return {
        id: strOrEmpty(row['id']),
        job_id: strOrEmpty(row['job_id']),
        system_key: strOrEmpty(row['system_key']),
        ref_value: strOrEmpty(row['ref_value']),
        created_at: strOrEmpty(row['created_at']),
        updated_at: strOrEmpty(row['updated_at']),
    };
}

export function mapRowToJobCategory(row: Record<string, unknown>): JobCategory {
    return {
        id: strOrEmpty(row['id']),
        job_id: strOrEmpty(row['job_id']),
        category_id: strOrEmpty(row['category_id']),
        is_default: toBool(row['is_default']),
        created_at: strOrEmpty(row['created_at']),
    };
}

export function mapRowToJobTemplate(row: Record<string, unknown>): JobTemplate {
    return {
        id: strOrEmpty(row['id']),
        name: strOrEmpty(row['name']),
        content: strOrEmpty(row['content']),
        placeholders: strOrEmpty(row['placeholders']),
        created_at: strOrEmpty(row['created_at']),
        updated_at: strOrEmpty(row['updated_at']),
    };
}

export function mapRowToDataField(row: Record<string, unknown>): DataField {
    return {
        id: strOrEmpty(row['id']),
        entity_type_id: strOrEmpty(row['entity_type_id']),
        data_type: asDataTypeKey(row['data_type']),
        key: strOrEmpty(row['key']),
        label: strOrEmpty(row['label']),
        view_type: strOrEmpty(row['view_type']),
        is_required: toBool(row['is_required']),
        is_system: toBool(row['is_system']),
        default_value: strOrEmpty(row['default_value']),
        options: strOrEmpty(row['options']),
        relation_entity_key: strOrEmpty(row['relation_entity_key']),
        sort_order: Number(row['sort_order'] ?? 0),
        created_at: strOrEmpty(row['created_at']),
    };
}
