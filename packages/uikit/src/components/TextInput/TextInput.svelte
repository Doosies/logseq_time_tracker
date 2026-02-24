<script lang="ts">
    import * as styles from '../../design/styles/text_input.css';

    interface TextInputProps {
        value?: string | undefined;
        placeholder?: string | undefined;
        disabled?: boolean | undefined;
        oninput?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        placeholder = '',
        disabled = false,
        oninput,
    }: TextInputProps = $props();

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        value = target.value;
        oninput?.(target.value);
    };
</script>

<div class={styles.text_input_container}>
    <input
        type="text"
        class={styles.text_input_element}
        {disabled}
        {placeholder}
        bind:value
        oninput={handleInput}
    />
</div>
