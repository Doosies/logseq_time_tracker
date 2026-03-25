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

    function parseEnumOptions(raw: string): string[] {
        const t = raw.trim();
        if (t.length === 0) {
            return [];
        }
        try {
            const parsed = JSON.parse(t) as unknown;
            if (Array.isArray(parsed)) {
                return parsed.map((x) => String(x).trim()).filter((s) => s.length > 0);
            }
        } catch {
            /* comma-separated */
        }
        return t
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
    }

    const options = $derived(parseEnumOptions(field.options));

    const current = $derived(value === null || value === undefined ? '' : String(value));

    const is_radio = $derived(field.view_type === 'radio');
    const is_chip = $derived(field.view_type === 'chip');
</script>

<div class={css.field_block}>
    <span class={css.label} id="{field.id}-label"
        >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</span
    >

    {#if options.length === 0}
        <p class={css.error_text} role="alert">선택지(options)가 없습니다</p>
    {:else if is_radio}
        <div class={css.row} role="radiogroup" aria-labelledby="{field.id}-label">
            {#each options as opt (opt)}
                <label class={css.row}>
                    <input
                        type="radio"
                        name={field.id}
                        value={opt}
                        checked={current === opt}
                        disabled={readonly}
                        onchange={() => onChange(opt)}
                    />
                    <span class={css.radio_caption}>{opt}</span>
                </label>
            {/each}
        </div>
    {:else if is_chip}
        <div class={css.chip_row} role="group" aria-labelledby="{field.id}-label">
            {#each options as opt (opt)}
                <button
                    type="button"
                    class={`${css.chip}${current === opt ? ` ${css.chip_selected}` : ''}`}
                    disabled={readonly}
                    aria-pressed={current === opt}
                    onclick={() => onChange(opt)}
                >
                    {opt}
                </button>
            {/each}
        </div>
    {:else}
        <select
            id={field.id}
            class={css.select}
            value={current}
            disabled={readonly}
            onchange={(e) => onChange(e.currentTarget.value)}
        >
            <option value="">선택…</option>
            {#each options as opt (opt)}
                <option value={opt}>{opt}</option>
            {/each}
        </select>
    {/if}
</div>
