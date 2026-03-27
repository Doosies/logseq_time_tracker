import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import EnumField from '../../../ui/fields/components/enum_field.svelte';
import type { DataField, DataTypeKey } from '../../../types/meta';

function makeField(overrides: Partial<DataField> = {}): DataField {
    return {
        id: 'field-1',
        entity_type_id: 'job',
        data_type: 'enum' as DataTypeKey,
        key: 'test_field',
        label: '열거 필드',
        view_type: 'default',
        is_required: false,
        is_system: false,
        default_value: '',
        options: 'a,b',
        relation_entity_key: '',
        sort_order: 0,
        created_at: '2025-01-01T00:00:00.000Z',
        ...overrides,
    };
}

describe('EnumField', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-FIELD-008: options가 비면 role=alert 안내 표시', () => {
        const { getByRole } = render(EnumField, {
            props: { field: makeField({ options: '' }), value: '', onChange: vi.fn() },
        });
        expect(getByRole('alert')).toHaveTextContent('선택지(options)가 없습니다');
    });

    it('UC-FIELD-022: JSON 배열 options 파싱 후 select에서 선택', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(EnumField, {
            props: {
                field: makeField({ options: '["x", "y"]' }),
                value: '',
                onChange: on_change,
            },
        });
        await user.selectOptions(getByRole('combobox'), 'y');
        expect(on_change).toHaveBeenCalledWith('y');
    });

    it('UC-FIELD-023: view_type이 radio이면 라디오 그룹으로 선택', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(EnumField, {
            props: {
                field: makeField({ options: 'p,q', view_type: 'radio' }),
                value: '',
                onChange: on_change,
            },
        });
        await user.click(getByRole('radio', { name: 'q' }));
        expect(on_change).toHaveBeenCalledWith('q');
    });

    it('UC-FIELD-024: view_type이 chip이면 버튼 토글로 onChange', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(EnumField, {
            props: {
                field: makeField({ options: 'one,two', view_type: 'chip' }),
                value: '',
                onChange: on_change,
            },
        });
        await user.click(getByRole('button', { name: 'two' }));
        expect(on_change).toHaveBeenCalledWith('two');
    });

    it('UC-FIELD-025: 잘못된 JSON은 쉼표 구분 문자열로 폴백', async () => {
        const on_change = vi.fn();
        const user = userEvent.setup();
        const { getByRole } = render(EnumField, {
            props: {
                field: makeField({ options: 'not-json,ok' }),
                value: '',
                onChange: on_change,
            },
        });
        await user.selectOptions(getByRole('combobox'), 'ok');
        expect(on_change).toHaveBeenCalledWith('ok');
    });
});
