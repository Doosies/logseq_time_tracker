<!--
@component ElapsedTimer - 테마가 적용된 경과 시간 표시(tabular 숫자).
  Props: accumulated_ms, segment_start, is_paused, formatter (선택), class, label.
-->
<script lang="ts">
    import * as styles from '../../design/styles/elapsed_timer.css';

    function get_elapsed_ms(accumulated_ms: number, segment_start: string | null, is_paused: boolean): number {
        if (is_paused || !segment_start) {
            return accumulated_ms;
        }
        return accumulated_ms + (Date.now() - new Date(segment_start).getTime());
    }

    function format_duration(total_seconds: number): string {
        const hours = Math.floor(total_seconds / 3600);
        const minutes = Math.floor((total_seconds % 3600) / 60);
        const seconds = total_seconds % 60;
        return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
    }

    let {
        accumulated_ms,
        segment_start,
        is_paused,
        formatter = format_duration,
        class: extra_class,
        label = '경과 시간',
    }: {
        accumulated_ms: number;
        segment_start: string | null;
        is_paused: boolean;
        formatter?: (total_seconds: number) => string;
        class?: string | undefined;
        label?: string;
    } = $props();

    let display_text = $state('00:00:00');
    let raf_id: number | null = null;

    function tick() {
        const elapsed_ms = get_elapsed_ms(accumulated_ms, segment_start, is_paused);
        const total_seconds = Math.floor(elapsed_ms / 1000);
        display_text = formatter(total_seconds);
        if (!is_paused && segment_start) {
            raf_id = requestAnimationFrame(tick);
        }
    }

    $effect(() => {
        const elapsed_ms = get_elapsed_ms(accumulated_ms, segment_start, is_paused);
        display_text = formatter(Math.floor(elapsed_ms / 1000));
        if (!is_paused && segment_start) {
            raf_id = requestAnimationFrame(tick);
        }
        return () => {
            if (raf_id !== null) {
                cancelAnimationFrame(raf_id);
                raf_id = null;
            }
        };
    });

    const class_name = $derived([styles.elapsed_timer_display, extra_class].filter(Boolean).join(' '));
</script>

<span class={class_name} role="timer" aria-live="polite" aria-label={label}>{display_text}</span>
