<script lang="ts">
    import { ElapsedTimer } from '../../ElapsedTimer';

    let {
        accumulated_ms,
        segment_start,
        is_paused,
        formatter,
        label,
    }: {
        accumulated_ms: number;
        segment_start: string | null;
        is_paused: boolean;
        formatter?: (total_seconds: number) => string;
        label?: string;
    } = $props();
</script>

<ElapsedTimer
    {accumulated_ms}
    {segment_start}
    {is_paused}
    {...formatter !== undefined ? { formatter } : {}}
    {...label !== undefined ? { label } : {}}
/>
