<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import * as styles from '../../design/styles/textarea.css';

    interface TextareaProps extends Omit<HTMLAttributes<HTMLTextAreaElement>, 'oninput'> {
        value?: string | undefined;
        placeholder?: string | undefined;
        disabled?: boolean | undefined;
        rows?: number | undefined;
        monospace?: boolean | undefined;
        class?: string | undefined;
        oninput?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        placeholder = '',
        disabled = false,
        rows = 3,
        monospace = false,
        class: extra_class,
        oninput,
        ...rest
    }: TextareaProps = $props();

    const handleInput = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        value = target.value;
        oninput?.(target.value);
    };

    const class_name = $derived(
        [styles.textarea_element, monospace && styles.textarea_monospace, extra_class].filter(Boolean).join(' '),
    );
</script>

<div class={styles.textarea_container}>
    <textarea class={class_name} {disabled} {placeholder} {rows} bind:value oninput={handleInput} {...rest}></textarea>
</div>
