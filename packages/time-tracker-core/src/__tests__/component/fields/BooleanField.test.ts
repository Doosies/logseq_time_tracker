import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import BooleanField from '../../../ui/fields/components/boolean_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'boolean' as DataTypeKey,
        key: 'test_field',
        label: '불리언 필드',
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

describe('BooleanField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-006: 기본 토글 클릭 시 onChange(!checked) 호출', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(BooleanField, {
            props: { field: makeField(), value: false, onChange: on_change },
        });
        await user.click(getByRole('switch'));
        expect(on_change).toHaveBeenCalledWith(true);
    });

    it('UC-FIELD-016: 토글 상태 라벨이 켜짐·꺼짐으로 표시', () => {
        const { getByText, rerender } = render(BooleanField, {
            props: { field: makeField(), value: false, onChange: vi.fn() },
        });
        expect(getByText('꺼짐')).toBeTruthy();
        rerender({ field: makeField(), value: true, onChange: vi.fn() });
        expect(getByText('켜짐')).toBeTruthy();
    });

    it('UC-FIELD-017: view_type이 checkbox이면 체크박스로 변경 반영', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { container } = render(BooleanField, {
            props: {
                field: makeField({ view_type: 'checkbox' }),
                value: false,
                onChange: on_change,
            },
        });
        const cb = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
        expect(cb).toBeTruthy();
        await user.click(cb);
        expect(on_change).toHaveBeenCalledWith(true);
    });

    it('UC-FIELD-018: readonly 토글은 클릭해도 onChange 호출 없음', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(BooleanField, {
            props: { field: makeField(), value: false, onChange: on_change, readonly: true },
        });
        await user.click(getByRole('switch'));
        expect(on_change).not.toHaveBeenCalled();
    });
});
