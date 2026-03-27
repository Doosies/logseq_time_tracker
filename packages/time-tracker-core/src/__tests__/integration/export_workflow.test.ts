import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeApp } from '../../app/initialize';
import type { AppContext } from '../../app/context';
import type { Category } from '../../types/category';
import type { ExportData } from '../../types/export';
import type { Job } from '../../types/job';
import { DataExportService } from '../../services/data_export_service';

describe('데이터보내기·가져오기 워크플로 (통합)', () => {
    let ctx: AppContext;

    beforeEach(async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-06-01T09:00:00.000Z'));
        ctx = await initializeApp();
    });

    afterEach(() => {
        ctx.dispose();
        vi.useRealTimers();
    });

    it('UC-INTG-005 (UC-EXPORT-001): 사용자 데이터 없을 때 exportAll → 시드 카테고리만 있고 작업 등은 빈 배열', async () => {
        const export_service = new DataExportService(ctx.uow, ctx.logger);
        const data = await export_service.exportAll();
        expect(data.version).toBe('0.3.0');
        expect(data.exported_at).toMatch(/^\d{4}-/);
        expect(data.data.jobs).toEqual([]);
        expect(data.data.categories).toHaveLength(4);
        const category_names = data.data.categories.map((c) => c.name);
        for (const expected_name of ['개발', '분석', '회의', '기타']) {
            expect(category_names).toContain(expected_name);
        }
        expect(data.data.time_entries).toEqual([]);
        expect(data.data.job_history).toEqual([]);
        expect(data.data.job_categories).toEqual([]);
        expect(data.data.job_templates).toEqual([]);
        expect(data.data.external_refs).toEqual([]);
        expect(data.data.data_fields).toEqual([]);
        expect(data.data.settings).toEqual({});
    });

    it('UC-INTG-006 (UC-EXPORT-002): 데이터 있을 때 exportAll → importAll 라운드트립 success', async () => {
        const now = '2025-06-01T09:00:00.000Z';
        const category: Category = {
            id: 'cat-intg-export',
            name: '통합 카테고리',
            parent_id: null,
            is_active: true,
            sort_order: 1,
            created_at: now,
            updated_at: now,
        };
        const job: Job = {
            id: 'job-intg-export',
            title: '통합 작업',
            description: '',
            status: 'pending',
            custom_fields: '{}',
            created_at: now,
            updated_at: now,
        };
        await ctx.uow.categoryRepo.upsertCategory(category);
        await ctx.uow.jobRepo.upsertJob(job);

        const export_service_a = new DataExportService(ctx.uow, ctx.logger);
        const exported = await export_service_a.exportAll();

        const ctx_b = await initializeApp();
        try {
            const export_service_b = new DataExportService(ctx_b.uow, ctx_b.logger);
            const result = await export_service_b.importAll(exported);
            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.imported_counts['jobs']).toBe(1);
            expect(result.imported_counts['categories']).toBe(5);

            const jobs_b = await ctx_b.uow.jobRepo.getJobs();
            const cats_b = await ctx_b.uow.categoryRepo.getCategories();
            expect(jobs_b).toHaveLength(1);
            expect(jobs_b[0]!.title).toBe('통합 작업');
            expect(cats_b).toHaveLength(5);
            expect(cats_b.some((c) => c.name === '통합 카테고리')).toBe(true);
        } finally {
            ctx_b.dispose();
        }
    });

    it('UC-INTG-007 (UC-EXPORT-003): 잘못된 데이터 importAll → success=false, errors에 메시지', async () => {
        const invalid = {
            version: '0.3.0',
            exported_at: '2025-06-01T09:00:00.000Z',
            data: {
                jobs: [
                    {
                        id: 'bad-job',
                        title: 'x',
                        description: '',
                        status: 'not_a_real_status',
                        custom_fields: '{}',
                        created_at: '2025-06-01T09:00:00.000Z',
                        updated_at: '2025-06-01T09:00:00.000Z',
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
        } as unknown as ExportData;
        const export_service = new DataExportService(ctx.uow, ctx.logger);
        const result = await export_service.importAll(invalid);
        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
