<script lang="ts">
    import * as css from './field_primitives.css';
    import type { DataField } from '../../../types/meta';

    let {
        field,
        value,
        onChange,
        readonly = false,
    }: {
        field: DataField;
        value: unknown;
        onChange: (value: unknown) => void;
        readonly?: boolean;
    } = $props();

    const string_value = $derived(value === null || value === undefined ? '' : String(value));

    const input_type = $derived.by(() => {
        if (field.view_type === 'email') {
            return 'email';
        }
        if (field.view_type === 'url') {
            return 'url';
        }
        return 'text';
    });

    const is_textarea = $derived(field.view_type === 'textarea');
</script>

<div class={css.field_block}>
    <label class={css.label} for={field.id}
        >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</label
    >
    {#if is_textarea}
        <textarea
            id={field.id}
            class={css.textarea}
            rows={4}
            value={string_value}
            disabled={readonly}
            oninput={(e) => onChange(e.currentTarget.value)}
        ></textarea>
    {:else}
        <input
            id={field.id}
            class={css.input}
            type={input_type}
            value={string_value}
            disabled={readonly}
            oninput={(e) => onChange(e.currentTarget.value)}
        />
    {/if}
</div>
