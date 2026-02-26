<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    interface SelectOption {
        value: string;
        label: string;
    }

    interface Props extends Omit<HTMLAttributes<HTMLSelectElement>, 'onchange'> {
        value?: string | undefined;
        options: SelectOption[];
        disabled?: boolean | undefined;
        class?: string | undefined;
        onchange?: ((value: string) => void) | undefined;
    }

    let { value = $bindable(), options, disabled = false, class: extra_class, onchange, ...rest }: Props = $props();

    const handleChange = (e: Event) => {
        const target = e.target as HTMLSelectElement;
        value = target.value;
        onchange?.(target.value);
    };
</script>

<select class={extra_class} {disabled} bind:value onchange={handleChange} {...rest}>
    {#each options as option (option.value)}
        <option value={option.value}>{option.label}</option>
    {/each}
</select>
