<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import * as styles from '../../design/styles/text_input.css';

    interface TextInputProps extends Omit<HTMLAttributes<HTMLInputElement>, 'oninput'> {
        value?: string | undefined;
        placeholder?: string | undefined;
        disabled?: boolean | undefined;
        class?: string | undefined;
        oninput?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        placeholder = '',
        disabled = false,
        class: extra_class,
        oninput,
        ...rest
    }: TextInputProps = $props();

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        value = target.value;
        oninput?.(target.value);
    };

    const input_class_name = $derived([styles.text_input_element, extra_class].filter(Boolean).join(' '));
</script>

<div class={styles.text_input_container}>
    <input type="text" class={input_class_name} {disabled} {placeholder} bind:value oninput={handleInput} {...rest} />
</div>
