<script lang="ts">
    interface Props {
        value?: string | undefined;
        placeholder?: string | undefined;
        disabled?: boolean | undefined;
        rows?: number | undefined;
        class?: string | undefined;
        oninput?: ((value: string) => void) | undefined;
    }

    let {
        value = $bindable(),
        placeholder = '',
        disabled = false,
        rows = 3,
        class: extra_class,
        oninput,
    }: Props = $props();

    const handleInput = (e: Event) => {
        const target = e.target as HTMLTextAreaElement;
        value = target.value;
        oninput?.(target.value);
    };
</script>

<textarea class={extra_class} {disabled} {placeholder} {rows} bind:value oninput={handleInput}></textarea>
