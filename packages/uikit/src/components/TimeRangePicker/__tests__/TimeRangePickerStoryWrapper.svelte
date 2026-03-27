<script lang="ts">
    import TimeRangePicker from '../TimeRangePicker.svelte';

    interface Props {
        started_at: string;
        ended_at: string;
        onChange?: (start: string, end: string) => void;
        start_label?: string;
        end_label?: string;
        error_message?: string;
        class?: string;
    }

    let {
        started_at,
        ended_at,
        onChange = () => {},
        start_label,
        end_label,
        error_message,
        class: extra_class,
    }: Props = $props();
</script>

<TimeRangePicker
    {started_at}
    {ended_at}
    {onChange}
    start_label={start_label ?? '시작'}
    end_label={end_label ?? '종료'}
    error_message={error_message ?? '시작 시각은 종료 시각보다 이전이거나 같아야 합니다'}
    class={extra_class}
/>
