<script lang="ts">
    import type { SelectOption } from '../../../design/types';
    import * as ToggleInput from '../';
    import { TextInput } from '../../TextInput';
    import { Select } from '../../Select';

    interface Props {
        prefix_text?: string;
        disabled?: boolean;
        initial_text_mode?: boolean;
        options?: SelectOption[];
        on_toggle?: () => void;
        on_value_change?: (value: string) => void;
    }

    let {
        prefix_text = '접두사',
        disabled = false,
        initial_text_mode = false,
        options = [
            { value: 'a', label: 'A 옵션' },
            { value: 'b', label: 'B 옵션' },
        ],
        on_toggle,
        on_value_change,
    }: Props = $props();

    let value = $state('');
    // svelte-ignore state_referenced_locally
    let is_text_mode = $state(initial_text_mode);

    function handleToggle(): void {
        on_toggle?.();
    }
</script>

<ToggleInput.Root bind:value bind:isTextMode={is_text_mode} onToggle={handleToggle}>
    {#if prefix_text}
        <ToggleInput.Prefix>{prefix_text}</ToggleInput.Prefix>
    {/if}
    {#if is_text_mode}
        <TextInput bind:value {disabled} oninput={on_value_change} />
    {:else}
        <Select bind:value {options} {disabled} onchange={on_value_change} />
    {/if}
    <ToggleInput.Toggle />
</ToggleInput.Root>
