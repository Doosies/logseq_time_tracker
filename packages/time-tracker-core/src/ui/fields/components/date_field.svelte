<script lang="ts">
    import { DatePicker } from '@personal/uikit';
    import * as css from './field_primitives.css';
    import type { DataField } from '../../../types/meta';

    let {
        field,
        value,
        onChange,
        readonly = false,
    }: {
        field: DataField;
        value: unknown;
        onChange: (value: unknown) => void;
        readonly?: boolean;
    } = $props();

    const ymd = $derived.by(() => {
        if (value === null || value === undefined || value === '') {
            return null as string | null;
        }
        const s = String(value).trim();
        const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
        return m ? m[1]! : s.length >= 10 ? s.slice(0, 10) : s;
    });
</script>

<div class={css.field_block}>
    <span class={css.label} id="{field.id}-label"
        >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</span
    >
    <div class={css.time_row} aria-labelledby="{field.id}-label">
        {#if readonly}
            <span class={css.readonly_value}>{ymd ?? '—'}</span>
        {:else}
            <DatePicker value={ymd} onSelect={(d) => onChange(d)} />
        {/if}
    </div>
</div>
