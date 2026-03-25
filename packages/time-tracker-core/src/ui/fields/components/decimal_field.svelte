<script lang="ts">
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

    function toInputString(v: unknown): string {
        if (v === null || v === undefined || v === '') {
            return '';
        }
        if (typeof v === 'number' && Number.isFinite(v)) {
            return String(v);
        }
        return String(v);
    }

    const input_string = $derived(toInputString(value));

    function parseNumber(raw: string): number | null {
        const t = raw.trim();
        if (t === '') {
            return null;
        }
        const n = Number(t);
        return Number.isFinite(n) ? n : null;
    }

    function handleInput(raw: string) {
        const n = parseNumber(raw);
        if (n === null && raw.trim() === '') {
            onChange(null);
            return;
        }
        if (n === null) {
            onChange(raw);
            return;
        }
        onChange(n);
    }
</script>

<div class={css.field_block}>
    <label class={css.label} for={field.id}
        >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</label
    >
    <input
        id={field.id}
        class={css.input}
        type="number"
        step="any"
        value={input_string}
        disabled={readonly}
        oninput={(e) => handleInput(e.currentTarget.value)}
    />
</div>
