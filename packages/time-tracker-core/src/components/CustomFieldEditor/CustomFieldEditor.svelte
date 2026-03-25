<script lang="ts">
    import { FieldRenderer } from '../../ui/fields';
    import * as css from './custom_field_editor.css';
    import type { Category } from '../../types/category';
    import type { DataField } from '../../types/meta';
    import type { Job } from '../../types/job';

    interface Props {
        fields: DataField[];
        values: Record<string, unknown>;
        onChange: (key: string, value: unknown) => void;
        relation_jobs?: Job[];
        relation_categories?: Category[];
    }

    let { fields, values, onChange, relation_jobs = [], relation_categories = [] }: Props = $props();

    const sorted_fields = $derived([...fields].sort((a, b) => a.sort_order - b.sort_order));

    function isValueEmpty(field: DataField, value: unknown): boolean {
        if (value === null || value === undefined) {
            return true;
        }
        switch (field.data_type) {
            case 'string':
                return String(value).trim() === '';
            case 'decimal': {
                if (typeof value === 'number') {
                    return !Number.isFinite(value);
                }
                const s = String(value).trim();
                if (s === '') {
                    return true;
                }
                const n = Number(s);
                return Number.isNaN(n);
            }
            case 'date':
            case 'datetime':
                return String(value).trim() === '';
            case 'boolean':
                return false;
            case 'enum':
                return String(value).trim() === '';
            case 'relation':
                return String(value).trim() === '';
            default:
                return false;
        }
    }

    const field_errors = $derived.by(() => {
        const m: Record<string, string> = {};
        for (const f of sorted_fields) {
            if (!f.is_required) {
                continue;
            }
            const v = values[f.key];
            if (isValueEmpty(f, v)) {
                m[f.key] = '필수 입력입니다';
            }
        }
        return m;
    });

    function handleFieldChange(key: string, value: unknown) {
        onChange(key, value);
    }
</script>

<div class={css.root}>
    {#each sorted_fields as field (field.id)}
        <div class={css.field_wrap}>
            <FieldRenderer
                {field}
                value={values[field.key]}
                onChange={(v) => handleFieldChange(field.key, v)}
                {relation_jobs}
                {relation_categories}
            />
            {#if field_errors[field.key]}
                <p class={css.error_text} role="alert">{field_errors[field.key]}</p>
            {/if}
        </div>
    {/each}
</div>
