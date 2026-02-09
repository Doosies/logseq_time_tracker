<script lang="ts">
    import type { SelectOption } from '../../design/types';
    import * as styles from '../../design/styles/select.css';

    interface SelectProps {
        value?: string;
        options: SelectOption[];
        disabled?: boolean;
        onchange?: (value: string) => void;
    }

    let {
        value = $bindable(),
        options,
        disabled = false,
        onchange,
    }: SelectProps = $props();

    const handleChange = (e: Event) => {
        const target = e.target as HTMLSelectElement;
        value = target.value;
        onchange?.(target.value);
    };
</script>

<div class={styles.select_container}>
    <select
        class={styles.select_element}
        {disabled}
        bind:value
        onchange={handleChange}
    >
        {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>
