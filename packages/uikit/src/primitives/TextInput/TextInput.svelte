<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends Omit<HTMLAttributes<HTMLInputElement>, 'oninput'> {
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
    }: Props = $props();

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        value = target.value;
        oninput?.(target.value);
    };
</script>

<input type="text" class={extra_class} {disabled} {placeholder} bind:value oninput={handleInput} {...rest} />
