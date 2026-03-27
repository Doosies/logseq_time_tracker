import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeApp } from '../../app/initialize';
import type { AppContext } from '../../app/context';
import { StorageError } from '../../errors';
import type { JobTemplate } from '../../types/template';

describe('템플릿 저장소 동작 (MemoryUnitOfWork + StubTemplateRepository)', () => {
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

    it('UC-INTG-008 (UC-TMPL-001): templateRepo upsert/getTemplates/deleteTemplate 호출 시 StorageError (stub)', async () => {
        const template: JobTemplate = {
            id: 'tmpl-intg-1',
            name: '샘플',
            content: '본문',
            placeholders: '[]',
            created_at: '2025-06-01T09:00:00.000Z',
            updated_at: '2025-06-01T09:00:00.000Z',
        };

        try {
            await ctx.uow.templateRepo.upsertTemplate(template);
            expect.fail('StubTemplateRepository는 upsert 시 StorageError를 던져야 함');
        } catch (e) {
            expect(e).toBeInstanceOf(StorageError);
            expect((e as StorageError).message).toContain('Phase 2');
        }

        try {
            await ctx.uow.templateRepo.getTemplates();
            expect.fail('getTemplates는 StorageError를 던져야 함');
        } catch (e) {
            expect(e).toBeInstanceOf(StorageError);
        }

        try {
            await ctx.uow.templateRepo.deleteTemplate(template.id);
            expect.fail('deleteTemplate는 StorageError를 던져야 함');
        } catch (e) {
            expect(e).toBeInstanceOf(StorageError);
        }
    });

    it('UC-INTG-009 (UC-TMPL-002): 동일 id로 upsert 재시도 시에도 StorageError (stub)', async () => {
        const template: JobTemplate = {
            id: 'tmpl-intg-same',
            name: 'v1',
            content: 'a',
            placeholders: '[]',
            created_at: '2025-06-01T09:00:00.000Z',
            updated_at: '2025-06-01T09:00:00.000Z',
        };
        const updated: JobTemplate = { ...template, name: 'v2', content: 'b' };

        await expect(ctx.uow.templateRepo.upsertTemplate(template)).rejects.toThrow(StorageError);
        await expect(ctx.uow.templateRepo.upsertTemplate(updated)).rejects.toThrow(StorageError);
    });

    it('UC-INTG-010 (UC-TMPL-003): 존재하지 않는 id 조회 시 Stub은 null 대신 StorageError', async () => {
        await expect(ctx.uow.templateRepo.getTemplateById('no-such-template')).rejects.toThrow(StorageError);
    });
});
