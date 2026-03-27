<script lang="ts">
    /* eslint-disable @typescript-eslint/no-unused-vars -- stub mirrors real ElapsedTimer props */
    let {
        accumulated_ms: _accumulated_ms,
        segment_start: _segment_start,
        is_paused: _is_paused,
    }: {
        accumulated_ms: number;
        segment_start: string | null;
        is_paused: boolean;
    } = $props();
</script>

<span data-testid="mock-elapsed-timer" aria-hidden="true">—</span>
