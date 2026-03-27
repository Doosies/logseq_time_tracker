import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CustomFieldManager from '../../components/CustomFieldManager/CustomFieldManager.svelte';
import type { DataFieldService } from '../../services/data_field_service';
import type { DataField } from '../../types/meta';

function make_mock_data_field_service() {
    return {
        getFieldsByEntity: vi.fn().mockResolvedValue([]),
        createField: vi.fn().mockResolvedValue(undefined),
        deleteField: vi.fn().mockResolvedValue(undefined),
        updateField: vi.fn().mockResolvedValue(undefined),
    };
}

function data_field_service_prop(svc: ReturnType<typeof make_mock_data_field_service>): DataFieldService {
    return svc as unknown as DataFieldService;
}

function make_stored_field(overrides: Partial<DataField> = {}): DataField {
    const base: DataField = {
        id: 'df-1',
        entity_type_id: 'et-job',
        data_type: 'string',
        key: 'k1',
        label: '라벨 A',
        view_type: 'default',
        is_required: false,
        is_system: false,
        default_value: '',
        options: '',
        relation_entity_key: '',
        sort_order: 0,
        created_at: '2025-01-01T00:00:00.000Z',
    };
    return { ...base, ...overrides };
}

describe('CustomFieldManager', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('UC-CFM-001: "사용자 정의 필드" 제목 렌더링', () => {
        const svc = make_mock_data_field_service();
        const { getByRole } = render(CustomFieldManager, {
            props: { entity_type_id: 'et-job', data_field_service: data_field_service_prop(svc) },
        });
        expect(getByRole('heading', { name: '사용자 정의 필드', level: 2 })).toBeInTheDocument();
    });

    it('UC-CFM-002: getFieldsByEntity 호출 후 필드 목록 표시', async () => {
        const svc = make_mock_data_field_service();
        const f1 = make_stored_field({ id: 'a', key: 'a', label: '첫 필드', sort_order: 0 });
        const f2 = make_stored_field({ id: 'b', key: 'b', label: '둘째 필드', sort_order: 1 });
        svc.getFieldsByEntity.mockResolvedValue([f1, f2]);
        const { getByText, findByText } = render(CustomFieldManager, {
            props: { entity_type_id: 'et-job', data_field_service: data_field_service_prop(svc) },
        });
        await waitFor(() => expect(svc.getFieldsByEntity).toHaveBeenCalledWith('et-job'));
        expect(await findByText('첫 필드')).toBeInTheDocument();
        expect(getByText('둘째 필드')).toBeInTheDocument();
    });

    it('UC-CFM-003: "추가" 버튼 클릭 시 createField 호출 (key, label 입력)', async () => {
        const svc = make_mock_data_field_service();
        const user = userEvent.setup();
        const { getByLabelText, getByRole } = render(CustomFieldManager, {
            props: { entity_type_id: 'et-job', data_field_service: data_field_service_prop(svc) },
        });
        await waitFor(() => expect(svc.getFieldsByEntity).toHaveBeenCalled());
        await user.type(getByLabelText('key'), 'my_field');
        await user.type(getByLabelText('label'), '내 필드');
        await user.click(getByRole('button', { name: '추가' }));
        await waitFor(() => expect(svc.createField).toHaveBeenCalled());
        expect(svc.createField).toHaveBeenCalledWith(
            expect.objectContaining({
                entity_type_id: 'et-job',
                key: 'my_field',
                label: '내 필드',
            }),
        );
    });

    it('UC-CFM-004: key 또는 label 비어있으면 "key와 label은 필수입니다" 에러', async () => {
        const svc = make_mock_data_field_service();
        const user = userEvent.setup();
        const { getByRole, findByRole } = render(CustomFieldManager, {
            props: { entity_type_id: 'et-job', data_field_service: data_field_service_prop(svc) },
        });
        await waitFor(() => expect(svc.getFieldsByEntity).toHaveBeenCalled());
        await user.click(getByRole('button', { name: '추가' }));
        expect(await findByRole('alert')).toHaveTextContent('key와 label은 필수입니다');
        expect(svc.createField).not.toHaveBeenCalled();
    });

    it('UC-CFM-005: 시스템 필드 삭제 버튼 disabled', async () => {
        const svc = make_mock_data_field_service();
        const sys = make_stored_field({
            id: 'sys-1',
            key: 'system_key',
            label: '시스템 라벨',
            is_system: true,
        });
        svc.getFieldsByEntity.mockResolvedValue([sys]);
        const { findByText, getByText } = render(CustomFieldManager, {
            props: { entity_type_id: 'et-job', data_field_service: data_field_service_prop(svc) },
        });
        await findByText('시스템 필드');
        const row = getByText('시스템 필드').closest('li');
        expect(row).toBeTruthy();
        const del = within(row as HTMLElement).getByRole('button', { name: '삭제' });
        expect(del).toBeDisabled();
    });
});
