import { describe, expect, it } from 'vitest';
import type { ExportData } from '../../types/export';
import { ValidationError } from '../../errors';
import { validateExportData } from '../../types/export_schema';

const now = '2026-03-10T10:00:00.000Z';

function minimalValidExport(): ExportData {
    return {
        version: '0.3.0',
        exported_at: now,
        data: {
            jobs: [
                {
                    id: 'j1',
                    title: 't',
                    description: 'd',
                    status: 'pending',
                    custom_fields: '{}',
                    created_at: now,
                    updated_at: now,
                },
            ],
            categories: [
                {
                    id: 'c1',
                    name: 'cat',
                    parent_id: null,
                    is_active: true,
                    sort_order: 0,
                    created_at: now,
                    updated_at: now,
                },
            ],
            time_entries: [
                {
                    id: 'e1',
                    job_id: 'j1',
                    category_id: 'c1',
                    started_at: now,
                    ended_at: now,
                    duration_seconds: 0,
                    note: '',
                    is_manual: false,
                    created_at: now,
                    updated_at: now,
                },
            ],
            job_history: [
                {
                    id: 'h1',
                    job_id: 'j1',
                    from_status: null,
                    to_status: 'pending',
                    reason: '',
                    occurred_at: now,
                    created_at: now,
                },
            ],
            job_categories: [
                {
                    id: 'jc1',
                    job_id: 'j1',
                    category_id: 'c1',
                    is_default: true,
                    created_at: now,
                },
            ],
            job_templates: [
                {
                    id: 't1',
                    name: 'n',
                    content: '',
                    placeholders: '[]',
                    created_at: now,
                    updated_at: now,
                },
            ],
            external_refs: [
                {
                    id: 'r1',
                    job_id: 'j1',
                    system_key: 'k',
                    ref_value: 'v',
                    created_at: now,
                    updated_at: now,
                },
            ],
            data_fields: [],
            settings: {},
        },
    };
}

describe('validateExportData', () => {
    it('유효한 ExportData면 검증 통과', () => {
        const data = minimalValidExport();
        expect(validateExportData(data)).toEqual(data);
    });

    it('version 누락 시 ValidationError', () => {
        const { version: _v, ...rest } = minimalValidExport();
        expect(() => validateExportData(rest)).toThrow(ValidationError);
    });

    it('data.jobs가 배열이 아니면 ValidationError', () => {
        const data = {
            ...minimalValidExport(),
            data: { ...minimalValidExport().data, jobs: {} },
        };
        expect(() => validateExportData(data)).toThrow(ValidationError);
    });

    it('job.status가 잘못된 값이면 ValidationError', () => {
        const base = minimalValidExport();
        const data = {
            ...base,
            data: {
                ...base.data,
                jobs: [{ ...base.data.jobs[0], status: 'invalid_status' }],
            },
        };
        expect(() => validateExportData(data)).toThrow(ValidationError);
    });

    it('data.categories 내 is_active가 boolean이 아니면 ValidationError', () => {
        const base = minimalValidExport();
        const data = {
            ...base,
            data: {
                ...base.data,
                categories: [{ ...base.data.categories[0], is_active: 'yes' }],
            },
        };
        expect(() => validateExportData(data)).toThrow(ValidationError);
    });

    it('빈 data(모든 배열 [])면 검증 통과', () => {
        const data: ExportData = {
            version: '0.3.0',
            exported_at: now,
            data: {
                jobs: [],
                categories: [],
                time_entries: [],
                job_history: [],
                job_categories: [],
                job_templates: [],
                external_refs: [],
                data_fields: [],
                settings: {},
            },
        };
        expect(validateExportData(data)).toEqual(data);
    });

    it('data_fields 키가 없으면 기본값 []로 검증 통과', () => {
        const raw = {
            version: '0.3.0',
            exported_at: now,
            data: {
                jobs: [],
                categories: [],
                time_entries: [],
                job_history: [],
                job_categories: [],
                job_templates: [],
                external_refs: [],
                settings: {},
            },
        };
        const parsed = validateExportData(raw);
        expect(parsed.data.data_fields).toEqual([]);
    });

    it('에러 메시지에 경로 정보가 포함된다', () => {
        const base = minimalValidExport();
        const data = {
            ...base,
            data: {
                ...base.data,
                categories: [{ ...base.data.categories[0], is_active: 'nope' }],
            },
        };
        try {
            validateExportData(data);
            expect.fail('expected throw');
        } catch (e) {
            expect(e).toBeInstanceOf(ValidationError);
            const msg = (e as ValidationError).message;
            expect(msg).toContain('data.categories');
            expect(msg).toContain('is_active');
        }
    });
});
