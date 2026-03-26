<script lang="ts">
    import TimeRangePicker from '../TimeRangePicker.svelte';

    let {
        started_at,
        ended_at,
        onChange,
        error_message,
    }: {
        started_at: string;
        ended_at: string;
        onChange: (start: string, end: string) => void;
        error_message?: string | undefined;
    } = $props();
</script>

<TimeRangePicker {started_at} {ended_at} {onChange} {error_message} />
