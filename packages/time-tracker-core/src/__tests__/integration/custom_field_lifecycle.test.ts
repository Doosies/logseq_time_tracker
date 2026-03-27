import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initializeApp } from '../../app/initialize';
import type { AppContext } from '../../app/context';
import { ValidationError } from '../../errors';
import { DataFieldService } from '../../services/data_field_service';
import type { DataField } from '../../types/meta';

/** Job 엔티티용 시드 entity_type_id (DataFieldService 검증과 일치) */
const entity_type_id_job = 'et-job';

describe('커스텀 필드 생명주기 (DataFieldService 통합)', () => {
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

    it('UC-INTG-001: createField 후 getFieldsByEntity로 job(et-job) 필드 조회', async () => {
        const svc = ctx.services.data_field_service;
        expect(svc).toBeInstanceOf(DataFieldService);
        const created = await svc.createField({
            entity_type_id: entity_type_id_job,
            data_type: 'string',
            key: 'intg_priority',
            label: '우선순위',
        });
        const fields = await svc.getFieldsByEntity(entity_type_id_job);
        expect(fields.some((f) => f.id === created.id && f.key === 'intg_priority')).toBe(true);
    });

    it('UC-INTG-002: 동일 entity_type_id와 key로 중복 생성 시 ValidationError', async () => {
        const svc = ctx.services.data_field_service;
        await svc.createField({
            entity_type_id: entity_type_id_job,
            data_type: 'string',
            key: 'dup_key',
            label: '첫 필드',
        });
        await expect(
            svc.createField({
                entity_type_id: entity_type_id_job,
                data_type: 'string',
                key: 'dup_key',
                label: '둘째 필드',
            }),
        ).rejects.toThrow(ValidationError);
    });

    it('UC-INTG-003: 시스템 필드 삭제 시도 시 ValidationError (시스템 필드는 삭제할 수 없습니다)', async () => {
        const system_field: DataField = {
            id: 'sys-field-intg',
            entity_type_id: entity_type_id_job,
            data_type: 'string',
            key: 'system_reserved',
            label: '시스템',
            view_type: 'default',
            is_required: false,
            is_system: true,
            default_value: '',
            options: '',
            relation_entity_key: '',
            sort_order: 0,
            created_at: '2025-06-01T09:00:00.000Z',
        };
        await ctx.uow.dataFieldRepo.upsertDataField(system_field);

        await expect(ctx.services.data_field_service.deleteField(system_field.id)).rejects.toMatchObject({
            name: 'ValidationError',
            message: '시스템 필드는 삭제할 수 없습니다',
        });
    });

    it('UC-INTG-004: 필드 생성 → 업데이트 → 삭제 전체 라이프사이클', async () => {
        const svc = ctx.services.data_field_service;
        const created = await svc.createField({
            entity_type_id: entity_type_id_job,
            data_type: 'string',
            key: 'lifecycle_note',
            label: '초기 라벨',
        });
        const updated = await svc.updateField(created.id, { label: '수정된 라벨' });
        expect(updated.label).toBe('수정된 라벨');

        await svc.deleteField(created.id);
        const remaining = await svc.getFieldsByEntity(entity_type_id_job);
        expect(remaining.some((f) => f.id === created.id)).toBe(false);
    });
});
