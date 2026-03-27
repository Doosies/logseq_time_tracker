<script lang="ts">
    import TextInput from '../TextInput.svelte';

    interface Props {
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        rest_attrs?: Record<string, unknown>;
        on_input?: (value: string) => void;
    }

    let { value = $bindable(''), placeholder = '', disabled = false, rest_attrs = {}, on_input }: Props = $props();
</script>

<TextInput bind:value {placeholder} {disabled} oninput={on_input} {...rest_attrs} />
