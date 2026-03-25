<script lang="ts">
    import DatePicker from '../DatePicker/DatePicker.svelte';
    import * as css from './time_range_picker.css';

    let {
        started_at,
        ended_at,
        onChange,
    }: {
        started_at: string;
        ended_at: string;
        onChange: (start: string, end: string) => void;
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

    function sameInstantToMinute(a: string, b: string): boolean {
        const ta = new Date(a).getTime();
        const tb = new Date(b).getTime();
        if (Number.isNaN(ta) || Number.isNaN(tb)) {
            return false;
        }
        return Math.floor(ta / 60000) === Math.floor(tb / 60000);
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

    let start_date = $state('');
    let start_time = $state('');
    let end_date = $state('');
    let end_time = $state('');

    $effect(() => {
        const s = utcIsoToLocalParts(started_at);
        const e = utcIsoToLocalParts(ended_at);
        start_date = s.date;
        start_time = s.time;
        end_date = e.date;
        end_time = e.time;
    });

    const is_valid = $derived.by(() => {
        const s_iso = localDateTimeToUtcIso(start_date, start_time);
        const e_iso = localDateTimeToUtcIso(end_date, end_time);
        if (s_iso === null || e_iso === null) {
            return false;
        }
        return new Date(s_iso).getTime() <= new Date(e_iso).getTime();
    });

    $effect(() => {
        if (!is_valid) {
            return;
        }
        const s_iso = localDateTimeToUtcIso(start_date, start_time);
        const e_iso = localDateTimeToUtcIso(end_date, end_time);
        if (s_iso === null || e_iso === null) {
            return;
        }
        if (sameInstantToMinute(s_iso, started_at) && sameInstantToMinute(e_iso, ended_at)) {
            return;
        }
        onChange(s_iso, e_iso);
    });
</script>

<div class={`${css.root}${!is_valid ? ` ${css.root_invalid}` : ''}`}>
    <div class={css.row}>
        <span class={css.label} id="time-range-start-label">시작</span>
        <div class={css.time_row} aria-labelledby="time-range-start-label">
            <DatePicker value={start_date} onSelect={(d) => (start_date = d)} />
            <input class={css.time_input} type="time" bind:value={start_time} aria-label="시작 시각" />
        </div>
    </div>
    <div class={css.row}>
        <span class={css.label} id="time-range-end-label">종료</span>
        <div class={css.time_row} aria-labelledby="time-range-end-label">
            <DatePicker value={end_date} onSelect={(d) => (end_date = d)} />
            <input class={css.time_input} type="time" bind:value={end_time} aria-label="종료 시각" />
        </div>
    </div>
    {#if !is_valid}
        <p class={css.error} role="alert">시작 시각은 종료 시각보다 이전이거나 같아야 합니다</p>
    {/if}
</div>
