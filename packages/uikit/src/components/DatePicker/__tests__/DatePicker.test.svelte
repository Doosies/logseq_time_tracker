<script lang="ts">
    import DatePicker from '../DatePicker.svelte';

    let {
        value,
        onSelect,
        min,
        max,
    }: {
        value: string | null;
        onSelect: (date: string) => void;
        min?: string | undefined;
        max?: string | undefined;
    } = $props();
</script>

<DatePicker {value} {onSelect} {min} {max} />
