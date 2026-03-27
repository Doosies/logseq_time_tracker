import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DateField from '../../../ui/fields/components/date_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';

vi.mock('@personal/uikit', async () => {
    const { default: DatePicker } = await import('../../mocks/date_picker_stub.svelte');
    return { DatePicker };
});

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'date' as DataTypeKey,
        key: 'test_field',
        label: '날짜 필드',
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

describe('DateField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-009: 편집 모드에서 DatePicker(스텁)가 렌더링됨', () => {
        const { getByTestId } = render(DateField, {
            props: { field: makeField(), value: '', onChange: vi.fn() },
        });
        expect(getByTestId('mock-date-picker')).toBeTruthy();
    });

    it('UC-FIELD-026: 스텁에서 날짜 선택 시 onChange에 전달', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByTestId } = render(DateField, {
            props: { field: makeField(), value: null, onChange: on_change },
        });
        await user.click(within(getByTestId('mock-date-picker')).getByTestId('mock-dp-select'));
        expect(on_change).toHaveBeenCalledWith('2025-06-15');
    });

    it('UC-FIELD-027: readonly이면 YYYY-MM-DD 텍스트 표시', () => {
        const { getByText, queryByTestId } = render(DateField, {
            props: {
                field: makeField(),
                value: '2024-03-20T00:00:00.000Z',
                onChange: vi.fn(),
                readonly: true,
            },
        });
        expect(getByText('2024-03-20')).toBeTruthy();
        expect(queryByTestId('mock-date-picker')).toBeNull();
    });

    it('UC-FIELD-028: readonly이고 값이 없으면 대시(—) 표시', () => {
        const { getByText, queryByTestId } = render(DateField, {
            props: {
                field: makeField(),
                value: null,
                onChange: vi.fn(),
                readonly: true,
            },
        });
        expect(getByText('—')).toBeTruthy();
        expect(queryByTestId('mock-date-picker')).toBeNull();
    });
});
