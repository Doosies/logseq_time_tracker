import type { StatusKind } from './job_status';

export interface Job {
    id: string;
    title: string;
    description: string;
    status: StatusKind;
    custom_fields: string;
    created_at: string;
    updated_at: string;
}

export interface ParsedCustomFields {
    [key: string]: string | number | boolean;
}

export function parseCustomFields(raw: string): ParsedCustomFields {
    try {
        return JSON.parse(raw) as ParsedCustomFields;
    } catch {
        return {};
    }
}
