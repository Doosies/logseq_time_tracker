<script lang="ts">
    import type { Job } from '../../types';
    import { STRINGS } from '../../constants/strings';
    import { formatDuration } from '../../utils/time';
    import * as css from './job_list.css';

    let {
        job,
        is_selected,
        total_seconds = 0,
        onclick,
    }: {
        job: Job;
        is_selected: boolean;
        total_seconds?: number;
        onclick: () => void;
    } = $props();

    const status_label = $derived(STRINGS.job.status[job.status]);
    const duration_label = $derived(total_seconds > 0 ? formatDuration(total_seconds) : '');
</script>

<button
    type="button"
    class="{css.job_item}{is_selected ? ` ${css.job_item_selected}` : ''}"
    aria-current={is_selected ? 'true' : undefined}
    {onclick}
>
    <span class={css.job_title}>{job.title}</span>
    {#if duration_label}
        <span class={css.job_duration}>{duration_label}</span>
    {/if}
    <span class={css.status_badge}>{status_label}</span>
</button>
