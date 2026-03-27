import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import CustomFieldEditor from '../../components/CustomFieldEditor/CustomFieldEditor.svelte';
import type { DataField, DataTypeKey } from '../../types/meta';

function make_data_field(overrides: Partial<DataField> = {}): DataField {
    const base: DataField = {
        id: 'field-1',
        entity_type_id: 'et-job',
        data_type: 'string',
        key: 'f1',
        label: '첫 번째 필드',
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

describe('CustomFieldEditor', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('UC-CFE-001: fields 렌더링 시 각 필드 label 표시', () => {
        const on_change = vi.fn();
        const fields = [
            make_data_field({ id: 'a', key: 'a', label: '이름', sort_order: 0 }),
            make_data_field({ id: 'b', key: 'b', label: '설명', sort_order: 1 }),
        ];
        const { getByText } = render(CustomFieldEditor, {
            props: { fields, values: {}, onChange: on_change },
        });
        expect(getByText('이름')).toBeInTheDocument();
        expect(getByText('설명')).toBeInTheDocument();
    });

    it('UC-CFE-002: sort_order 기준 필드 정렬 확인', () => {
        const on_change = vi.fn();
        const fields = [
            make_data_field({ id: 'second', key: 'second', label: '나중', sort_order: 10 }),
            make_data_field({ id: 'first', key: 'first', label: '먼저', sort_order: 1 }),
        ];
        const { container } = render(CustomFieldEditor, {
            props: { fields, values: {}, onChange: on_change },
        });
        const labels = Array.from(container.querySelectorAll('label')).map((el) =>
            el.textContent?.replace(/\s*\*\s*$/, '').trim(),
        );
        const idx_먼저 = labels.findIndex((t) => t === '먼저');
        const idx_나중 = labels.findIndex((t) => t === '나중');
        expect(idx_먼저).toBeGreaterThanOrEqual(0);
        expect(idx_나중).toBeGreaterThanOrEqual(0);
        expect(idx_먼저).toBeLessThan(idx_나중);
    });

    it('UC-CFE-003: 필수 필드(is_required)에 값이 없으면 "필수 입력입니다" 에러 표시', () => {
        const on_change = vi.fn();
        const fields = [
            make_data_field({
                id: 'req',
                key: 'required_key',
                label: '필수항목',
                is_required: true,
            }),
        ];
        const { getByRole } = render(CustomFieldEditor, {
            props: { fields, values: {}, onChange: on_change },
        });
        expect(getByRole('alert')).toHaveTextContent('필수 입력입니다');
    });

    it('UC-CFE-004: 값 입력 시 onChange(key, value) 콜백 호출', async () => {
        const on_change = vi.fn();
        const fields = [
            make_data_field({
                id: 'txt',
                key: 'my_key',
                label: '텍스트',
                data_type: 'string' as DataTypeKey,
                is_required: false,
            }),
        ];
        const user = userEvent.setup();
        const { getByLabelText } = render(CustomFieldEditor, {
            props: { fields, values: { my_key: '' }, onChange: on_change },
        });
        const input = getByLabelText('텍스트', { selector: 'input' });
        await user.type(input, 'hello');
        expect(on_change).toHaveBeenCalled();
        const calls = on_change.mock.calls;
        const last = calls[calls.length - 1];
        expect(last?.[0]).toBe('my_key');
        expect(last?.[1]).toBe('hello');
    });
});
