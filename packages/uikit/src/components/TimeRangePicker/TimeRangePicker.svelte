<!--
@component TimeRangePicker - 시작·종료 날짜/시간 범위 선택 컴포넌트
-->
<script lang="ts">
    import { TimeRangePicker as PrimitiveTimeRangePicker } from '../../primitives/TimeRangePicker';
    import type { DatePickerClasses } from '../../primitives/DatePicker';
    import * as tr_styles from '../../design/styles/time_range_picker.css';
    import * as dp_styles from '../../design/styles/date_picker.css';

    interface Props {
        started_at: string;
        ended_at: string;
        onChange: (start: string, end: string) => void;
        start_label?: string | undefined;
        end_label?: string | undefined;
        error_message?: string | undefined;
        class?: string | undefined;
    }

    let { started_at, ended_at, onChange, start_label, end_label, error_message, class: extra_class }: Props = $props();

    const date_picker_classes = $derived({
        root: dp_styles.root,
        trigger: dp_styles.trigger,
        panel: dp_styles.panel,
        header: dp_styles.header,
        nav_button: dp_styles.nav_button,
        month_label: dp_styles.month_label,
        weekdays: dp_styles.weekdays,
        grid: dp_styles.grid,
        day_cell: dp_styles.day_cell,
        day_outside_month: dp_styles.day_outside_month,
        day_disabled: dp_styles.day_disabled,
        day_selected: dp_styles.day_selected,
        day_today: dp_styles.day_today,
    } satisfies DatePickerClasses);

    const range_classes = $derived({
        root: [tr_styles.root, extra_class].filter(Boolean).join(' '),
        root_invalid: tr_styles.root_invalid,
        row: tr_styles.row,
        label: tr_styles.label,
        time_row: tr_styles.time_row,
        time_input: tr_styles.time_input,
        error: tr_styles.error,
    });
</script>

<PrimitiveTimeRangePicker
    {started_at}
    {ended_at}
    {onChange}
    {start_label}
    {end_label}
    {error_message}
    classes={range_classes}
    {date_picker_classes}
/>
