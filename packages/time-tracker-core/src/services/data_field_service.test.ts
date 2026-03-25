import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryUnitOfWork } from '../adapters/storage/memory';
import { ValidationError } from '../errors';
import type { DataField } from '../types/meta';
import { DataFieldService } from './data_field_service';

describe('DataFieldService', () => {
    let uow: MemoryUnitOfWork;
    let service: DataFieldService;

    beforeEach(() => {
        uow = new MemoryUnitOfWork();
        service = new DataFieldService(uow);
    });

    it('UC-DFIELD-001: 사용자 정의 필드 생성 — 유효 파라미터, is_system false, enum options', async () => {
        const field = await service.createField({
            entity_type_id: 'et-job',
            data_type: 'enum',
            key: 'priority',
            label: '우선순위',
            view_type: 'select',
            options: '["low","high"]',
            is_required: true,
            sort_order: 2,
        });
        expect(field.is_system).toBe(false);
        expect(field.data_type).toBe('enum');
        expect(field.options).toBe('["low","high"]');
        expect(field.view_type).toBe('select');
        const list = await service.getFieldsByEntity('et-job');
        expect(list.some((f) => f.id === field.id)).toBe(true);
    });

    it('UC-DFIELD-002: 시스템 필드 삭제 거부 — is_system true 이면 ValidationError', async () => {
        const now = '2026-01-01T00:00:00.000Z';
        const system_field: DataField = {
            id: 'sys-1',
            entity_type_id: 'et-job',
            data_type: 'string',
            key: 'system_key',
            label: '시스템',
            view_type: 'default',
            is_required: false,
            is_system: true,
            default_value: '',
            options: '',
            relation_entity_key: '',
            sort_order: 0,
            created_at: now,
        };
        await uow.dataFieldRepo.upsertDataField(system_field);
        await expect(service.deleteField('sys-1')).rejects.toMatchObject({
            name: 'ValidationError',
            message: '시스템 필드는 삭제할 수 없습니다',
        });
    });

    it('UC-DFIELD-003: (entity_type_id, key) 유일성 — 동일 엔티티에 중복 key 시 ValidationError', async () => {
        await service.createField({
            entity_type_id: 'et-category',
            data_type: 'string',
            key: 'code',
            label: '코드',
        });
        await expect(
            service.createField({
                entity_type_id: 'et-category',
                data_type: 'string',
                key: 'code',
                label: '다른 라벨',
            }),
        ).rejects.toBeInstanceOf(ValidationError);
    });
});
