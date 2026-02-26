<script lang="ts">
    import * as ToggleInput from '../';
    import { TextInput } from '../../TextInput';
    import { Select } from '../../Select';

    interface Props {
        isTextMode?: boolean;
        prefix?: string;
        onToggle?: () => void;
        onchange?: (value: string) => void;
    }

    let { isTextMode = false, prefix = '', onToggle, onchange }: Props = $props();
    let value = $state('a');
    const get_initial_text_mode = (): boolean => isTextMode;
    let is_text_mode = $state(get_initial_text_mode());

    const options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
    ];

    function handleToggle(): void {
        onToggle?.();
    }
</script>

<ToggleInput.Root bind:value bind:isTextMode={is_text_mode} onToggle={handleToggle}>
    {#if prefix}
        <ToggleInput.Prefix>{prefix}</ToggleInput.Prefix>
    {/if}
    {#if is_text_mode}
        <TextInput bind:value oninput={onchange} />
    {:else}
        <Select bind:value {options} {onchange} />
    {/if}
    <ToggleInput.Toggle>
        {is_text_mode ? '🔽' : '✏️'}
    </ToggleInput.Toggle>
</ToggleInput.Root>
