<script lang="ts">
    import type { Job } from '../../types';
    import { STRINGS } from '../../constants/strings';
    import * as css from './job_list.css';

    let {
        job,
        is_selected,
        onclick,
    }: {
        job: Job;
        is_selected: boolean;
        onclick: () => void;
    } = $props();

    const status_label = $derived(STRINGS.job.status[job.status]);
</script>

<button
    type="button"
    class="{css.job_item}{is_selected ? ` ${css.job_item_selected}` : ''}"
    aria-current={is_selected ? 'true' : undefined}
    {onclick}
>
    <span class={css.job_title}>{job.title}</span>
    <span class={css.status_badge}>{status_label}</span>
</button>
