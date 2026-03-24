import type { Job } from '../types';

export function createJobStore() {
    let jobs = $state<Job[]>([]);
    let selected_job_id = $state<string | null>(null);
    let selected_category_id = $state<string | null>(null);
    let is_loading = $state(false);

    const selected_job = $derived(jobs.find((j) => j.id === selected_job_id) ?? null);
    const active_job = $derived(jobs.find((j) => j.status === 'in_progress') ?? null);
    const pending_jobs = $derived(jobs.filter((j) => j.status === 'pending'));
    const paused_jobs = $derived(jobs.filter((j) => j.status === 'paused'));

    function setJobs(new_jobs: Job[]): void {
        jobs = new_jobs;
    }

    function selectJob(id: string | null): void {
        selected_job_id = id;
    }

    function selectCategory(id: string | null): void {
        selected_category_id = id;
    }

    function addJob(job: Job): void {
        jobs = [...jobs, job];
    }

    function removeJob(id: string): void {
        jobs = jobs.filter((j) => j.id !== id);
        if (selected_job_id === id) selected_job_id = null;
    }

    function updateJobInList(updated_job: Job): void {
        jobs = jobs.map((j) => (j.id === updated_job.id ? updated_job : j));
    }

    return {
        get jobs() {
            return jobs;
        },
        get selected_job_id() {
            return selected_job_id;
        },
        get selected_category_id() {
            return selected_category_id;
        },
        get is_loading() {
            return is_loading;
        },
        get selected_job() {
            return selected_job;
        },
        get active_job() {
            return active_job;
        },
        get pending_jobs() {
            return pending_jobs;
        },
        get paused_jobs() {
            return paused_jobs;
        },
        setJobs,
        selectJob,
        selectCategory,
        addJob,
        removeJob,
        updateJobInList,
        set is_loading(val: boolean) {
            is_loading = val;
        },
    };
}

export type JobStore = ReturnType<typeof createJobStore>;
