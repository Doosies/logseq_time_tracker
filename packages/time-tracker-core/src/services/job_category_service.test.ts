import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import type { Category } from '../types/category';
import type { Job } from '../types/job';
import { ValidationError } from '../errors';
import { JobCategoryService } from './job_category_service';

describe('JobCategoryService', () => {
    let uow: MemoryUnitOfWork;
    let service: JobCategoryService;
    let job: Job;
    let category: Category;

    beforeEach(async () => {
        uow = new MemoryUnitOfWork();
        service = new JobCategoryService(uow);
        const now = '2026-01-01T00:00:00.000Z';
        category = {
            id: 'cat-1',
            name: 'C',
            parent_id: null,
            is_active: true,
            sort_order: 1,
            created_at: now,
            updated_at: now,
        };
        await uow.categoryRepo.upsertCategory(category);
        job = {
            id: 'job-1',
            title: 'J',
            description: '',
            status: 'pending',
            custom_fields: '{}',
            created_at: now,
            updated_at: now,
        };
        await uow.jobRepo.upsertJob(job);
    });

    it('UC-JCAT-001: linkJobCategory: 생성 후 조회', async () => {
        const jc = await service.linkJobCategory(job.id, category.id);
        expect(jc.job_id).toBe(job.id);
        expect(jc.category_id).toBe(category.id);
        const list = await service.getJobCategories(job.id);
        expect(list).toHaveLength(1);
    });

    it('linkJobCategory: 중복 링크는 기존 행 반환', async () => {
        const a = await service.linkJobCategory(job.id, category.id);
        const b = await service.linkJobCategory(job.id, category.id);
        expect(b.id).toBe(a.id);
    });

    it('UC-JCAT-002: linkJobCategory: is_default true 시 단일 기본값', async () => {
        const now = '2026-01-01T00:00:00.000Z';
        const cat2: Category = {
            id: 'cat-2',
            name: 'C2',
            parent_id: null,
            is_active: true,
            sort_order: 2,
            created_at: now,
            updated_at: now,
        };
        await uow.categoryRepo.upsertCategory(cat2);
        await service.linkJobCategory(job.id, category.id, true);
        await service.linkJobCategory(job.id, cat2.id, true);
        const list = await service.getJobCategories(job.id);
        const defaults = list.filter((x) => x.is_default);
        expect(defaults).toHaveLength(1);
        expect(defaults[0]!.category_id).toBe(cat2.id);
    });

    it('setDefaultCategory: 링크 없으면 생성 후 기본값 설정', async () => {
        await service.setDefaultCategory(job.id, category.id);
        const list = await service.getJobCategories(job.id);
        expect(list).toHaveLength(1);
        expect(list[0]!.is_default).toBe(true);
    });

    it('unlinkJobCategory: id로 삭제', async () => {
        const jc = await service.linkJobCategory(job.id, category.id);
        await service.unlinkJobCategory(jc.id);
        expect(await service.getJobCategories(job.id)).toHaveLength(0);
    });

    it('UC-JCAT-003: linkJobCategory: 존재하지 않는 job이면 ValidationError', async () => {
        await expect(service.linkJobCategory('missing', category.id)).rejects.toThrow(ValidationError);
    });

    it('linkJobCategory: 존재하지 않는 category이면 ValidationError', async () => {
        await expect(service.linkJobCategory(job.id, 'missing-cat')).rejects.toThrow(ValidationError);
    });

    it('getCategoryJobs: category_id로 위임', async () => {
        await service.linkJobCategory(job.id, category.id);
        const refs = await service.getCategoryJobs(category.id);
        expect(refs).toHaveLength(1);
    });
});
