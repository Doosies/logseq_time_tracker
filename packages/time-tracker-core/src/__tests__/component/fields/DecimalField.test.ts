import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import DecimalField from '../../../ui/fields/components/decimal_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'decimal' as DataTypeKey,
        key: 'test_field',
        label: '숫자 필드',
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

describe('DecimalField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-007: 유한한 숫자 문자열 입력 시 onChange에 숫자 전달', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(DecimalField, {
            props: { field: makeField(), value: '', onChange: on_change },
        });
        const input = getByRole('spinbutton');
        await user.clear(input);
        await user.type(input, '3.14');
        expect(on_change.mock.calls.some((c) => c[0] === 3.14)).toBe(true);
    });

    it('UC-FIELD-019: 빈 값이면 onChange(null)', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(DecimalField, {
            props: { field: makeField(), value: 1, onChange: on_change },
        });
        const input = getByRole('spinbutton');
        await user.clear(input);
        expect(on_change).toHaveBeenCalledWith(null);
    });

    it('UC-FIELD-020: 비숫자 입력 시 onChange에 원시 문자열 전달', () => {
        const on_change = vi.fn();
        const { getByRole } = render(DecimalField, {
            props: { field: makeField(), value: '', onChange: on_change },
        });
        const input = getByRole('spinbutton') as HTMLInputElement;
        const value_spy = vi.spyOn(input, 'value', 'get').mockReturnValue('abc');
        input.dispatchEvent(new InputEvent('input', { bubbles: true }));
        value_spy.mockRestore();
        expect(on_change).toHaveBeenCalledWith('abc');
    });

    it('UC-FIELD-021: number 타입 step="any" 속성', () => {
        const { getByRole } = render(DecimalField, {
            props: { field: makeField(), value: '', onChange: vi.fn() },
        });
        expect(getByRole('spinbutton')).toHaveAttribute('step', 'any');
    });
});
