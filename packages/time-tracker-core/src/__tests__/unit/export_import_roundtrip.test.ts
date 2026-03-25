import { describe, expect, it } from 'vitest';
import { MemoryUnitOfWork } from '../../adapters/storage/memory';
import type { Category } from '../../types/category';
import type { ExportData } from '../../types/export';
import type { Job } from '../../types/job';
import type { JobHistory } from '../../types/history';
import type { TimeEntry } from '../../types/time_entry';
import { DataExportService } from '../../services/data_export_service';

const now = '2026-03-10T10:00:00.000Z';

function strip_export_meta(data: ExportData): Omit<ExportData, 'exported_at'> & { exported_at?: string } {
    const { exported_at: _e, ...rest } = data;
    return rest;
}

function normalize_export_for_compare(data: ExportData) {
    const jobs = [...data.data.jobs].sort((a, b) => a.id.localeCompare(b.id));
    const categories = [...data.data.categories].sort((a, b) => a.id.localeCompare(b.id));
    const time_entries = [...data.data.time_entries].sort((a, b) => a.id.localeCompare(b.id));
    const job_history = [...data.data.job_history].sort((a, b) => a.id.localeCompare(b.id));
    const job_categories = [...data.data.job_categories].sort((a, b) => a.id.localeCompare(b.id));
    const job_templates = [...data.data.job_templates].sort((a, b) => a.id.localeCompare(b.id));
    const external_refs = [...data.data.external_refs].sort((a, b) => a.id.localeCompare(b.id));
    const data_fields = [...data.data.data_fields].sort((a, b) => a.id.localeCompare(b.id));
    return {
        ...strip_export_meta(data),
        data: {
            jobs,
            categories,
            time_entries,
            job_history,
            job_categories,
            job_templates,
            external_refs,
            data_fields,
            settings: { ...data.data.settings },
        },
    };
}

describe('DataExportService export·import 라운드트립', () => {
    it('UC-STORE-007: exportAll → importAll → exportAll 데이터 동등(exported_at 제외)', async () => {
        const uow_a = new MemoryUnitOfWork();
        const category: Category = {
            id: 'c1',
            name: '분류',
            parent_id: null,
            is_active: true,
            sort_order: 1,
            created_at: now,
            updated_at: now,
        };
        const job: Job = {
            id: 'j1',
            title: '작업',
            description: 'd',
            status: 'pending',
            custom_fields: '{"k":"v"}',
            created_at: now,
            updated_at: now,
        };
        const entry: TimeEntry = {
            id: 'e1',
            job_id: 'j1',
            category_id: 'c1',
            started_at: '2026-03-10T08:00:00.000Z',
            ended_at: '2026-03-10T09:00:00.000Z',
            duration_seconds: 3600,
            note: 'n',
            is_manual: true,
            created_at: now,
            updated_at: now,
        };
        const history: JobHistory = {
            id: 'h1',
            job_id: 'j1',
            from_status: null,
            to_status: 'pending',
            reason: 'r',
            occurred_at: '2026-03-10T07:00:00.000Z',
            created_at: now,
        };
        await uow_a.categoryRepo.upsertCategory(category);
        await uow_a.jobRepo.upsertJob(job);
        await uow_a.timeEntryRepo.upsertTimeEntry(entry);
        await uow_a.historyRepo.appendJobHistory(history);
        await uow_a.settingsRepo.setSetting('last_selected_category', 'c1');

        const first = await new DataExportService(uow_a).exportAll();
        const uow_b = new MemoryUnitOfWork();
        const import_result = await new DataExportService(uow_b).importAll(first);
        expect(import_result.success).toBe(true);

        const second = await new DataExportService(uow_b).exportAll();
        expect(normalize_export_for_compare(first)).toEqual(normalize_export_for_compare(second));
    });

    it('UC-MIGRATE-002: 0.1.0보내기 마이그레이션 후 import·export 구조가 0.3.0과 맞는다', async () => {
        const legacy: ExportData = {
            version: '0.1.0',
            exported_at: now,
            data: {
                jobs: [
                    {
                        id: 'j1',
                        title: '레거시',
                        description: '',
                        status: 'completed',
                        custom_fields: '{}',
                        created_at: now,
                        updated_at: now,
                    },
                ],
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
        const uow = new MemoryUnitOfWork();
        const result = await new DataExportService(uow).importAll(legacy);
        expect(result.success).toBe(true);

        const out = await new DataExportService(uow).exportAll();
        expect(out.version).toBe('0.3.0');
        expect(out.data.job_categories).toEqual([]);
        expect(out.data.job_templates).toEqual([]);
        expect(out.data.external_refs).toEqual([]);
        expect(out.data.data_fields).toEqual([]);
        expect(out.data.jobs).toHaveLength(1);
        expect(out.data.jobs[0]!.title).toBe('레거시');
    });
});
