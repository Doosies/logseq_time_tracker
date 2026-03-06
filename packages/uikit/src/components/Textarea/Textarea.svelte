<script lang="ts">
    import { Textarea as PrimitiveTextarea } from '../../primitives/Textarea';
    import * as styles from '../../design/styles/textarea.css';

    interface TextareaProps {
        value?: string | undefined;
        placeholder?: string | undefined;
        disabled?: boolean | undefined;
        rows?: number | undefined;
        monospace?: boolean | undefined;
        oninput?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        placeholder = '',
        disabled = false,
        rows = 3,
        monospace = false,
        oninput,
    }: TextareaProps = $props();

    const class_name = $derived(
        [styles.textarea_element, monospace && styles.textarea_monospace].filter(Boolean).join(' '),
    );
</script>

<div class={styles.textarea_container}>
    <PrimitiveTextarea class={class_name} bind:value {disabled} {placeholder} {rows} {oninput} />
</div>
