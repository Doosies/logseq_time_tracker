<!--
@component DatePicker - 달력 기반 날짜 선택 컴포넌트
-->
<script lang="ts">
    import { DatePicker as PrimitiveDatePicker, type DatePickerClasses } from '../../primitives/DatePicker';
    import * as styles from '../../design/styles/date_picker.css';

    interface Props {
        value: string | null;
        onSelect: (date: string) => void;
        min?: string | undefined;
        max?: string | undefined;
        locale?: string | undefined;
        class?: string | undefined;
    }

    let { value, onSelect, min, max, locale = 'ko-KR', class: extra_class }: Props = $props();

    const date_picker_classes = $derived({
        root: [styles.root, extra_class].filter(Boolean).join(' '),
        trigger: styles.trigger,
        panel: styles.panel,
        header: styles.header,
        nav_button: styles.nav_button,
        month_label: styles.month_label,
        weekdays: styles.weekdays,
        grid: styles.grid,
        day_cell: styles.day_cell,
        day_outside_month: styles.day_outside_month,
        day_disabled: styles.day_disabled,
        day_selected: styles.day_selected,
        day_today: styles.day_today,
    } satisfies DatePickerClasses);
</script>

<PrimitiveDatePicker {value} {onSelect} {min} {max} {locale} classes={date_picker_classes} />
