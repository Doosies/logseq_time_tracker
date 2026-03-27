<!--
@component CheckboxList.Item - Individual checkbox item with drag handle

Renders a drag handle, checkbox input, and children label.
Must be used inside CheckboxList.Root's item snippet with handleAttach.

@prop checked - Checkbox checked state
@prop disabled - Disables the checkbox
@prop ontoggle - Callback when checkbox is toggled
@prop handleAttach - Drag handle attach from Dnd.Sortable (required in sortable context)
-->
<script lang="ts">
    import { checkbox_list_item, checkbox_list_item_disabled } from '../../design/styles/checkbox_list.css';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        checked?: boolean;
        disabled?: boolean;
        ontoggle?: () => void;
        handleAttach?: unknown;
        children: Snippet;
        class?: string;
    }

    let {
        checked = false,
        disabled = false,
        ontoggle,
        handleAttach,
        children,
        class: extra_class,
        ...rest
    }: Props = $props();

    const class_name = $derived(
        [checkbox_list_item, disabled ? checkbox_list_item_disabled : '', extra_class].filter(Boolean).join(' '),
    );
</script>

<div class={class_name} {...rest}>
    {#if handleAttach}
        <span data-drag-handle role="button" tabindex="0" aria-label="드래그하여 순서 변경" {@attach handleAttach}>
            ⠿
        </span>
    {/if}
    <label style="display:flex;align-items:center;gap:0.5em;flex:1;min-width:0;cursor:pointer;">
        <input type="checkbox" {checked} {disabled} onchange={ontoggle} />
        {@render children()}
    </label>
</div>
