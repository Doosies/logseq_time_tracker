<script lang="ts">
    import ElapsedTimer from '../ElapsedTimer.svelte';

    interface Props {
        accumulated_ms?: number;
        segment_start?: string | null;
        is_paused?: boolean;
        label?: string;
        formatter?: (total_seconds: number) => string;
        class?: string;
    }

    let {
        accumulated_ms = 0,
        segment_start = null,
        is_paused = true,
        label,
        formatter,
        class: extra_class,
    }: Props = $props();
</script>

<ElapsedTimer
    {accumulated_ms}
    {segment_start}
    {is_paused}
    label={label ?? '경과 시간'}
    class={extra_class}
    {...formatter !== undefined ? { formatter } : {}}
/>
