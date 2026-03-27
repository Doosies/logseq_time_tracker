import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import RelationField from '../../../ui/fields/components/relation_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';
import type { Job } from '../../../types/job';
import type { Category } from '../../../types/category';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'relation' as DataTypeKey,
        key: 'rel_field',
        label: '관계 필드',
        view_type: 'default',
        is_required: false,
        is_system: false,
        default_value: '',
        options: '',
        relation_entity_key: 'job',
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

function makeCategory(id: string, name: string): Category {
    const now = '2025-01-01T00:00:00.000Z';
    return {
        id,
        name,
        parent_id: null,
        is_active: true,
        sort_order: 0,
        created_at: now,
        updated_at: now,
    };
}

describe('RelationField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-011: relation_entity_key가 job이고 jobs가 있으면 JobSelector(combobox) 표시', () => {
        const jobs = [makeJob('j1', '작업 A')];
        const { getByRole } = render(RelationField, {
            props: {
                field: makeField({ relation_entity_key: 'job' }),
                value: null,
                onChange: vi.fn(),
                jobs,
                categories: [],
            },
        });
        expect(getByRole('combobox')).toBeTruthy();
        expect(getByRole('combobox')).toHaveTextContent('작업 선택');
    });

    it('UC-FIELD-032: jobs가 비어 있으면 텍스트 입력(엔티티 ID) 폴백', () => {
        const { getByPlaceholderText } = render(RelationField, {
            props: {
                field: makeField({ relation_entity_key: 'job' }),
                value: '',
                onChange: vi.fn(),
                jobs: [],
                categories: [],
            },
        });
        expect(getByPlaceholderText('엔티티 ID')).toBeTruthy();
    });

    it('UC-FIELD-033: relation_entity_key가 category이고 categories가 있으면 CategorySelector', () => {
        const categories = [makeCategory('c1', '분류')];
        const { getByRole } = render(RelationField, {
            props: {
                field: makeField({ relation_entity_key: 'category' }),
                value: null,
                onChange: vi.fn(),
                jobs: [],
                categories,
            },
        });
        expect(getByRole('combobox')).toHaveTextContent('카테고리 선택');
    });

    it('UC-FIELD-034: readonly이면 선택 ID 또는 대시 표시', () => {
        const { getByText, rerender } = render(RelationField, {
            props: {
                field: makeField(),
                value: 'entity-99',
                onChange: vi.fn(),
                readonly: true,
                jobs: [],
                categories: [],
            },
        });
        expect(getByText('entity-99')).toBeTruthy();
        rerender({
            field: makeField(),
            value: null,
            onChange: vi.fn(),
            readonly: true,
            jobs: [],
            categories: [],
        });
        expect(getByText('—')).toBeTruthy();
    });

    it('UC-FIELD-035: 폴백 텍스트 입력 시 onChange 호출', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByPlaceholderText } = render(RelationField, {
            props: {
                field: makeField({ relation_entity_key: 'other' }),
                value: '',
                onChange: on_change,
                jobs: [makeJob('j1', 'x')],
                categories: [],
            },
        });
        const input = getByPlaceholderText('엔티티 ID');
        await user.type(input, 'id-1');
        expect(on_change.mock.calls.length).toBeGreaterThan(0);
    });
});
