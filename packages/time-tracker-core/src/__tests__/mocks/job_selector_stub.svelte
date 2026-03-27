<script lang="ts">
    import type { Job } from '../../types/job';
    import type { StatusKind } from '../../types/job_status';

    /* eslint-disable @typescript-eslint/no-unused-vars -- stub mirrors real JobSelector props */
    let {
        jobs: _jobs,
        selected_id: _selected_id,
        onSelect: _on_select,
    }: {
        jobs: Job[];
        selected_id: string | null;
        onSelect: (id: string | null) => void;
        status_filter?: StatusKind[];
    } = $props();
</script>

<div data-testid="mock-job-selector"></div>
