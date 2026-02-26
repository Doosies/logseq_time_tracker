<script lang="ts">
    import { TextInput as PrimitiveTextInput } from '../../primitives/TextInput';
    import * as styles from '../../design/styles/text_input.css';

    interface TextInputProps {
        value?: string | undefined;
        placeholder?: string | undefined;
        disabled?: boolean | undefined;
        oninput?: ((value: string) => void) | undefined;
    }

    let { value = $bindable(), placeholder = '', disabled = false, oninput }: TextInputProps = $props();
</script>

<div class={styles.text_input_container}>
    <PrimitiveTextInput class={styles.text_input_element} bind:value {disabled} {placeholder} {oninput} />
</div>
