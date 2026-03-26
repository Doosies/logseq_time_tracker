<!--
@component ElapsedTimer - 테마가 적용된 경과 시간 표시(tabular 숫자)
-->
<script lang="ts">
    import { ElapsedTimer as PrimitiveElapsedTimer } from '../../primitives/ElapsedTimer';
    import * as styles from '../../design/styles/elapsed_timer.css';

    let {
        accumulated_ms,
        segment_start,
        is_paused,
        formatter,
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

    const class_name = $derived([styles.elapsed_timer_display, extra_class].filter(Boolean).join(' '));
</script>

<PrimitiveElapsedTimer
    {accumulated_ms}
    {segment_start}
    {is_paused}
    class={class_name}
    {label}
    {...formatter !== undefined ? { formatter } : {}}
/>
