<script lang="ts">
    import { getElapsedMs, formatDuration } from '../../utils';
    import * as css from './timer.css';

    let {
        accumulated_ms,
        current_segment_start,
        is_paused,
    }: {
        accumulated_ms: number;
        current_segment_start: string | null;
        is_paused: boolean;
    } = $props();

    let display_text = $state('00:00:00');
    let raf_id: number | null = null;

    function tick() {
        const elapsed_ms = getElapsedMs(accumulated_ms, current_segment_start, is_paused);
        const total_seconds = Math.floor(elapsed_ms / 1000);
        display_text = formatDuration(total_seconds);
        if (!is_paused && current_segment_start) {
            raf_id = requestAnimationFrame(tick);
        }
    }

    $effect(() => {
        const elapsed_ms = getElapsedMs(accumulated_ms, current_segment_start, is_paused);
        display_text = formatDuration(Math.floor(elapsed_ms / 1000));
        if (!is_paused && current_segment_start) {
            raf_id = requestAnimationFrame(tick);
        }
        return () => {
            if (raf_id !== null) {
                cancelAnimationFrame(raf_id);
                raf_id = null;
            }
        };
    });
</script>

<div class={css.timer_display} role="timer" aria-live="polite" aria-label="경과 시간">
    {display_text}
</div>
