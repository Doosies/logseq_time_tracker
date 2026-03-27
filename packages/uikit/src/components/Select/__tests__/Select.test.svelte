<script lang="ts">
    import type { SelectOption } from '../../../design/types';
    import Select from '../Select.svelte';

    interface Props {
        options: SelectOption[];
        value?: string;
        disabled?: boolean;
        on_change?: (value: string) => void;
    }

    let { options, value = $bindable(''), disabled = false, on_change }: Props = $props();
</script>

<Select bind:value {options} {disabled} onchange={on_change} />
