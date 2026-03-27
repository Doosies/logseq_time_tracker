<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import type { SelectOption } from '../../design/types';
    import * as styles from '../../design/styles/select.css';

    interface SelectProps extends Omit<HTMLAttributes<HTMLSelectElement>, 'onchange'> {
        value?: string | undefined;
        options: SelectOption[];
        disabled?: boolean | undefined;
        class?: string | undefined;
        onchange?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        options,
        disabled = false,
        class: extra_class,
        onchange,
        ...rest
    }: SelectProps = $props();

    const handleChange = (e: Event) => {
        const target = e.target as HTMLSelectElement;
        value = target.value;
        onchange?.(target.value);
    };

    const select_class_name = $derived([styles.select_element, extra_class].filter(Boolean).join(' '));
</script>

<div class={styles.select_container}>
    <select class={select_class_name} {disabled} bind:value onchange={handleChange} {...rest}>
        {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>
