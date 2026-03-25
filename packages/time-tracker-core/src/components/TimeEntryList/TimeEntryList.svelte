<script lang="ts">
    import * as css from './time_entry_list.css';
    import type { TimeEntry } from '../../types/time_entry';
    import type { Job } from '../../types/job';
    import type { Category } from '../../types/category';
    import { DatePicker } from '../DatePicker';
    import { JobSelector } from '../JobSelector';

    let {
        entries,
        jobs,
        categories,
        onEdit,
        onDelete,
    }: {
        entries: TimeEntry[];
        jobs: Job[];
        categories: Category[];
        onEdit: (id: string) => void;
        onDelete: (id: string) => void;
    } = $props();

    let filter_from = $state<string | null>(null);
    let filter_to = $state<string | null>(null);
    let filter_job_id = $state<string | null>(null);

    const job_title_by_id = $derived.by(() => {
        const rec: Record<string, string> = {};
        for (const j of jobs) {
            rec[j.id] = j.title;
        }
        return rec;
    });

    const category_name_by_id = $derived.by(() => {
        const rec: Record<string, string> = {};
        for (const c of categories) {
            rec[c.id] = c.name;
        }
        return rec;
    });

    const filtered_entries = $derived.by(() => {
        let list = [...entries];
        list.sort((a, b) => b.started_at.localeCompare(a.started_at));
        if (filter_job_id !== null) {
            list = list.filter((e) => e.job_id === filter_job_id);
        }
        const from_bound = filter_from;
        if (from_bound !== null && from_bound !== '') {
            list = list.filter((e) => e.started_at.slice(0, 10) >= from_bound);
        }
        const to_bound = filter_to;
        if (to_bound !== null && to_bound !== '') {
            list = list.filter((e) => e.started_at.slice(0, 10) <= to_bound);
        }
        return list;
    });

    const range_fmt = new Intl.DateTimeFormat('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    function formatEntryRange(started_at: string, ended_at: string): string {
        return `${range_fmt.format(new Date(started_at))} ~ ${range_fmt.format(new Date(ended_at))}`;
    }

    function formatDurationSeconds(total_seconds: number): string {
        const s = Math.max(0, Math.floor(total_seconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
</script>

<div class={css.root} aria-label="시간 기록 목록">
    <div class={css.filters}>
        <div class={css.filter_field}>
            <span class={css.filter_label} id="tel-filter-from">시작일(이후)</span>
            <DatePicker value={filter_from} onSelect={(d) => (filter_from = d)} />
        </div>
        <div class={css.filter_field}>
            <span class={css.filter_label} id="tel-filter-to">종료일(이전)</span>
            <DatePicker value={filter_to} onSelect={(d) => (filter_to = d)} />
        </div>
        <div class={css.filter_field}>
            <span class={css.filter_label} id="tel-filter-job">작업</span>
            <JobSelector {jobs} selected_id={filter_job_id} onSelect={(id) => (filter_job_id = id)} />
        </div>
    </div>

    {#if filtered_entries.length === 0}
        <p class={css.empty} role="status">기록된 시간이 없습니다</p>
    {:else}
        <ul class={css.list}>
            {#each filtered_entries as entry (entry.id)}
                <li class={css.item}>
                    <div class={css.item_main}>
                        <div class={css.item_title}>
                            {job_title_by_id[entry.job_id] ?? entry.job_id}
                        </div>
                        <div class={css.item_meta}>
                            {category_name_by_id[entry.category_id] ?? entry.category_id}
                        </div>
                        <div class={css.item_time}>
                            {formatEntryRange(entry.started_at, entry.ended_at)}
                        </div>
                        <div class={css.duration_badge}>{formatDurationSeconds(entry.duration_seconds)}</div>
                    </div>
                    <div class={css.item_actions}>
                        <button type="button" class={css.action_button} onclick={() => onEdit(entry.id)}> 수정 </button>
                        <button
                            type="button"
                            class={`${css.action_button} ${css.action_delete}`}
                            onclick={() => onDelete(entry.id)}
                        >
                            삭제
                        </button>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</div>
