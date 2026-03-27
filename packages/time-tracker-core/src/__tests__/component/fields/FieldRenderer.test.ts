import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import * as field_component_registry from '../../../ui/fields/field_component_registry';
import FieldRenderer from '../../../ui/fields/field_renderer.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';
import type { Job } from '../../../types/job';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'string' as DataTypeKey,
        key: 'test_field',
        label: '렌더 필드',
        view_type: 'default',
        is_required: false,
        is_system: false,
        default_value: '',
        options: '',
        relation_entity_key: '',
        sort_order: 0,
        created_at: '2025-01-01T00:00:00.000Z',
        ...overrides,
    };
}

function makeJob(id: string, title: string): Job {
    const now = '2025-01-01T00:00:00.000Z';
    return {
        id,
        title,
        description: '',
        status: 'pending',
        custom_fields: '{}',
        created_at: now,
        updated_at: now,
    };
}

describe('FieldRenderer', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('UC-FIELD-012: data_type이 string이면 StringField 경로로 텍스트 입력 렌더', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(FieldRenderer, {
            props: {
                field: makeField({ data_type: 'string' }),
                value: '',
                onChange: on_change,
            },
        });
        const input = getByRole('textbox');
        await user.type(input, 'z');
        expect(on_change.mock.calls.length).toBeGreaterThan(0);
    });

    it('UC-FIELD-036: data_type이 relation이면 RelationField로 전달(빈 jobs 시 폴백 입력)', () => {
        const { getByPlaceholderText } = render(FieldRenderer, {
            props: {
                field: makeField({
                    data_type: 'relation',
                    relation_entity_key: 'job',
                }),
                value: '',
                onChange: vi.fn(),
                relation_jobs: [],
                relation_categories: [],
            },
        });
        expect(getByPlaceholderText('엔티티 ID')).toBeTruthy();
    });

    it('UC-FIELD-037: relation_jobs가 있으면 작업 선택 콤보박스 표시', () => {
        const { getByRole } = render(FieldRenderer, {
            props: {
                field: makeField({
                    data_type: 'relation',
                    relation_entity_key: 'job',
                }),
                value: null,
                onChange: vi.fn(),
                relation_jobs: [makeJob('j1', 'R 작업')],
                relation_categories: [],
            },
        });
        expect(getByRole('combobox')).toHaveTextContent('작업 선택');
    });

    it('UC-FIELD-038: resolveFieldComponent가 null이면 텍스트 input 폴백 및 onchange', () => {
        const on_change = vi.fn();
        vi.spyOn(field_component_registry, 'resolveFieldComponent').mockReturnValue(null as never);
        const { container } = render(FieldRenderer, {
            props: {
                field: makeField({ data_type: 'string' }),
                value: 'init',
                onChange: on_change,
            },
        });
        const fallback = container.querySelector('input[type="text"]') as HTMLInputElement;
        expect(fallback).toBeTruthy();
        fireEvent.change(fallback, { target: { value: '바꿈' } });
        expect(on_change).toHaveBeenCalledWith('바꿈');
    });
});
