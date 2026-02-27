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
    import { Item as PrimitiveItem } from '../../primitives/CheckboxList';
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

    let { checked, disabled, ontoggle, handleAttach, children, class: extra_class, ...rest }: Props = $props();

    const class_name = $derived(
        [checkbox_list_item, disabled ? checkbox_list_item_disabled : '', extra_class].filter(Boolean).join(' '),
    );
</script>

<PrimitiveItem
    class={class_name}
    {...checked != null ? { checked } : {}}
    {...disabled != null ? { disabled } : {}}
    {...ontoggle != null ? { ontoggle } : {}}
    {...handleAttach != null ? { handleAttach } : {}}
    {...rest}
>
    {@render children()}
</PrimitiveItem>
