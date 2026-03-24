<script lang="ts">
    import type { Job } from '../../types';
    import JobListItem from './JobListItem.svelte';
    import * as css from './job_list.css';

    let {
        jobs,
        selected_job_id,
        onselect,
    }: {
        jobs: Job[];
        selected_job_id: string | null;
        onselect: (id: string) => void;
    } = $props();
</script>

<ul class={css.job_list_container} aria-label="작업 목록">
    {#each jobs as job (job.id)}
        <li class={css.job_list_row}>
            <JobListItem {job} is_selected={job.id === selected_job_id} onclick={() => onselect(job.id)} />
        </li>
    {/each}
</ul>
