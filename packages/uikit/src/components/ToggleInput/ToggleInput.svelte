<script lang="ts">
    import type { SelectOption } from '../../design/types';
    import * as styles from '../../design/styles/toggle_input.css';
    import { Select } from '../Select';
    import { TextInput } from '../TextInput';

    interface ToggleInputProps {
        value?: string | undefined;
        prefix?: string | undefined;
        options: SelectOption[];
        isTextMode?: boolean | undefined;
        onToggle?: (() => void) | undefined;
        onchange?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        prefix = '',
        options,
        isTextMode = false,
        onToggle,
        onchange,
    }: ToggleInputProps = $props();
</script>

<div class={styles.toggle_input_container}>
    {#if prefix}
        <div class={styles.prefix_container}>{prefix}</div>
    {/if}
    
    {#if isTextMode}
        <TextInput bind:value oninput={onchange}  />
    {:else}
        <Select bind:value {options} onchange={onchange} />
    {/if}
    
    <button
        type="button"
        class={styles.toggle_icon}
        onclick={onToggle}
        aria-label="Toggle input mode"
    >
        {isTextMode ? '🔽' : '✏️'}
    </button>
</div>
