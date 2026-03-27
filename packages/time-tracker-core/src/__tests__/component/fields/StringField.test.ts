import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import StringField from '../../../ui/fields/components/string_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'string' as DataTypeKey,
        key: 'test_field',
        label: '테스트 필드',
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

describe('StringField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-005: 기본 view_type에서 텍스트 입력 시 onChange에 값 전달', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(StringField, {
            props: { field: makeField(), value: '', onChange: on_change },
        });
        const input = getByRole('textbox');
        await user.clear(input);
        await user.type(input, 'hello');
        expect(on_change).toHaveBeenCalled();
        const last = on_change.mock.calls.at(-1)?.[0];
        expect(String(last)).toContain('hello');
    });

    it('UC-FIELD-013: view_type이 textarea이면 textarea로 렌더링', () => {
        const { container } = render(StringField, {
            props: {
                field: makeField({ view_type: 'textarea' }),
                value: '본문',
                onChange: vi.fn(),
            },
        });
        expect(container.querySelector('textarea')).toBeTruthy();
        expect(container.querySelector('input[type="text"]')).toBeFalsy();
    });

    it('UC-FIELD-014: view_type이 email·url이면 각각 type 속성 적용', () => {
        const { rerender, getByRole } = render(StringField, {
            props: {
                field: makeField({ view_type: 'email' }),
                value: '',
                onChange: vi.fn(),
            },
        });
        expect(getByRole('textbox')).toHaveAttribute('type', 'email');
        rerender({
            field: makeField({ view_type: 'url' }),
            value: '',
            onChange: vi.fn(),
        });
        expect(getByRole('textbox')).toHaveAttribute('type', 'url');
    });

    it('UC-FIELD-015: readonly이면 입력 비활성화', () => {
        const { getByRole } = render(StringField, {
            props: {
                field: makeField(),
                value: '고정',
                onChange: vi.fn(),
                readonly: true,
            },
        });
        expect(getByRole('textbox')).toBeDisabled();
    });
});
