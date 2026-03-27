<script lang="ts">
    import Textarea from '../Textarea.svelte';

    interface Props {
        value?: string;
        placeholder?: string;
        disabled?: boolean;
        on_input?: (value: string) => void;
    }

    let { value = $bindable(''), placeholder = '', disabled = false, on_input }: Props = $props();
</script>

<Textarea bind:value {placeholder} {disabled} oninput={on_input} />
