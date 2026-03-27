import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DatetimeField from '../../../ui/fields/components/datetime_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';

vi.mock('@personal/uikit', async () => {
    const { default: DatePicker } = await import('../../mocks/date_picker_stub.svelte');
    return { DatePicker };
});

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'datetime' as DataTypeKey,
        key: 'test_field',
        label: '일시 필드',
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

describe('DatetimeField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-010: 편집 모드에서 DatePicker 스텁과 시각 입력이 함께 표시', () => {
        const { getByTestId, getByLabelText } = render(DatetimeField, {
            props: { field: makeField(), value: '', onChange: vi.fn() },
        });
        expect(getByTestId('mock-date-picker')).toBeTruthy();
        expect(getByLabelText('시각')).toHaveAttribute('type', 'time');
    });

    it('UC-FIELD-029: 날짜 선택 후 시각 입력 시 onChange(UTC ISO) 호출', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByTestId, getByLabelText } = render(DatetimeField, {
            props: { field: makeField(), value: '', onChange: on_change },
        });
        await user.click(within(getByTestId('mock-date-picker')).getByTestId('mock-dp-select'));
        const time_input = getByLabelText('시각');
        await user.clear(time_input);
        await user.type(time_input, '14:30');
        expect(on_change.mock.calls.length).toBeGreaterThan(0);
        const last_iso = on_change.mock.calls.at(-1)?.[0] as string;
        expect(last_iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('UC-FIELD-030: readonly이면 원본 값 문자열 표시', () => {
        const iso = '2025-01-10T12:00:00.000Z';
        const { getByText, queryByTestId } = render(DatetimeField, {
            props: {
                field: makeField(),
                value: iso,
                onChange: vi.fn(),
                readonly: true,
            },
        });
        expect(getByText(iso)).toBeTruthy();
        expect(queryByTestId('mock-date-picker')).toBeNull();
    });

    it('UC-FIELD-031: readonly이고 값이 없으면 대시(—) 표시', () => {
        const { getByText } = render(DatetimeField, {
            props: {
                field: makeField(),
                value: null,
                onChange: vi.fn(),
                readonly: true,
            },
        });
        expect(getByText('—')).toBeTruthy();
    });
});
