<script lang="ts">
    import DatePicker from '../../../components/DatePicker/DatePicker.svelte';
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

    function formatYmdLocal(d: Date): string {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function formatTimeLocal(d: Date): string {
        const h = d.getHours();
        const min = d.getMinutes();
        return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }

    function utcIsoToLocalParts(iso: string): { date: string; time: string } {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) {
            const fallback = new Date();
            return { date: formatYmdLocal(fallback), time: formatTimeLocal(fallback) };
        }
        return { date: formatYmdLocal(d), time: formatTimeLocal(d) };
    }

    function localDateTimeToUtcIso(date_str: string, time_str: string): string | null {
        const dm = date_str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        const tm = time_str.match(/^(\d{2}):(\d{2})$/);
        if (!dm || !tm) {
            return null;
        }
        const d = new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), Number(tm[1]), Number(tm[2]), 0, 0);
        if (Number.isNaN(d.getTime())) {
            return null;
        }
        return d.toISOString();
    }

    let date_part = $state('');
    let time_part = $state('');

    $effect(() => {
        if (value === null || value === undefined || value === '') {
            date_part = '';
            time_part = '';
            return;
        }
        const s = String(value);
        const parts = utcIsoToLocalParts(s);
        date_part = parts.date;
        time_part = parts.time;
    });

    function emitIfComplete() {
        if (readonly) {
            return;
        }
        if (date_part === '' || time_part === '') {
            if (date_part === '' && time_part === '') {
                onChange(null);
            }
            return;
        }
        const iso = localDateTimeToUtcIso(date_part, time_part);
        if (iso !== null) {
            onChange(iso);
        }
    }

    function handleDateSelect(d: string) {
        date_part = d;
        emitIfComplete();
    }

    function handleTimeInput(t: string) {
        time_part = t;
        emitIfComplete();
    }
</script>

<div class={css.field_block}>
    <span class={css.label} id="{field.id}-label"
        >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</span
    >
    <div class={css.time_row} aria-labelledby="{field.id}-label">
        {#if readonly}
            <span class={css.readonly_value}
                >{value === null || value === undefined || value === '' ? '—' : String(value)}</span
            >
        {:else}
            <DatePicker value={date_part === '' ? null : date_part} onSelect={handleDateSelect} />
            <input
                class={css.time_input}
                type="time"
                value={time_part}
                aria-label="시각"
                oninput={(e) => handleTimeInput(e.currentTarget.value)}
            />
        {/if}
    </div>
</div>
