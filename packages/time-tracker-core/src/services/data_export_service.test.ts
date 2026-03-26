import { describe, expect, it } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import type { Category } from '../types/category';
import type { ExportData } from '../types/export';
import type { Job } from '../types/job';
import { DataExportService } from './data_export_service';

describe('DataExportService', () => {
    it('UC-EXPORT-004: exportAll: 빈 스토어에서 버전과 구조 반환', async () => {
        const uow = new MemoryUnitOfWork();
        const svc = new DataExportService(uow);
        const data = await svc.exportAll();
        expect(data.version).toBe('0.3.0');
        expect(data.exported_at).toMatch(/^\d{4}-/);
        expect(data.data.jobs).toEqual([]);
        expect(data.data.categories).toEqual([]);
        expect(data.data.data_fields).toEqual([]);
        expect(data.data.settings).toEqual({});
    });

    it('UC-EXPORT-005: importAll: export 결과를 다른 UoW에 복원', async () => {
        const now = '2026-02-01T12:00:00.000Z';
        const uow_a = new MemoryUnitOfWork();
        const category: Category = {
            id: 'c1',
            name: 'Cat',
            parent_id: null,
            is_active: true,
            sort_order: 1,
            created_at: now,
            updated_at: now,
        };
        const job: Job = {
            id: 'j1',
            title: 'Job',
            description: '',
            status: 'pending',
            custom_fields: '{}',
            created_at: now,
            updated_at: now,
        };
        await uow_a.categoryRepo.upsertCategory(category);
        await uow_a.jobRepo.upsertJob(job);

        const exported = await new DataExportService(uow_a).exportAll();
        const uow_b = new MemoryUnitOfWork();
        const result = await new DataExportService(uow_b).importAll(exported);
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
        expect(result.imported_counts['jobs']).toBe(1);
        expect(result.imported_counts['categories']).toBe(1);

        const jobs_b = await uow_b.jobRepo.getJobs();
        const cats_b = await uow_b.categoryRepo.getCategories();
        expect(jobs_b).toHaveLength(1);
        expect(jobs_b[0]!.title).toBe('Job');
        expect(cats_b).toHaveLength(1);
        expect(cats_b[0]!.name).toBe('Cat');
    });

    it('UC-EXPORT-006: importAll: 0.1.0 마이그레이션 후 성공', async () => {
        const now = '2025-01-01T00:00:00.000Z';
        const legacy: ExportData = {
            version: '0.1.0',
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
        const uow = new MemoryUnitOfWork();
        const result = await new DataExportService(uow).importAll(legacy);
        expect(result.success).toBe(true);
    });

    it('UC-EXPORT-007: importAll: 지원하지 않는 버전이면 실패', async () => {
        const bad: ExportData = {
            version: '99.0.0',
            exported_at: 'x',
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
        const uow = new MemoryUnitOfWork();
        const result = await new DataExportService(uow).importAll(bad);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
