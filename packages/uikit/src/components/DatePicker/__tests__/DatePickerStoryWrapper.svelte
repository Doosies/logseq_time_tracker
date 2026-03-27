<script lang="ts">
    import DatePicker from '../DatePicker.svelte';

    interface Props {
        value?: string | null;
        onSelect?: (date: string) => void;
        min?: string;
        max?: string;
        locale?: string;
        class?: string;
    }

    let { value = null, onSelect = () => {}, min, max, locale, class: extra_class }: Props = $props();
</script>

<DatePicker {value} {onSelect} {min} {max} {locale} class={extra_class} />
