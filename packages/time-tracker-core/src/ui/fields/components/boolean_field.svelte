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

    const checked = $derived(value === true);

    const is_checkbox = $derived(field.view_type === 'checkbox');

    function toggle() {
        if (readonly) {
            return;
        }
        onChange(!checked);
    }
</script>

<div class={css.field_block}>
    {#if is_checkbox}
        <div class={css.row}>
            <input
                id={field.id}
                type="checkbox"
                {checked}
                disabled={readonly}
                onchange={(e) => onChange(e.currentTarget.checked)}
            />
            <label class={css.label} for={field.id}
                >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true">
                        *</span
                    >{/if}</label
            >
        </div>
    {:else}
        <span class={css.label} id="{field.id}-label"
            >{field.label}{#if field.is_required}<span class={css.required_mark} aria-hidden="true"> *</span>{/if}</span
        >
        <div class={css.row}>
            <button
                type="button"
                class={`${css.toggle_track} ${checked ? css.toggle_on : css.toggle_off}`}
                disabled={readonly}
                role="switch"
                aria-checked={checked}
                aria-labelledby="{field.id}-label"
                onclick={toggle}
            >
                <span class={`${css.toggle_thumb} ${checked ? css.toggle_thumb_on : ''}`}></span>
            </button>
            <span class={css.toggle_state_label}>{checked ? '켜짐' : '꺼짐'}</span>
        </div>
    {/if}
</div>
