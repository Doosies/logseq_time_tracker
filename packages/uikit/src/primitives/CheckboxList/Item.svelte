<script lang="ts">
    import { Row, Handle } from '../Dnd';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    interface Props extends HTMLAttributes<HTMLDivElement> {
        checked?: boolean;
        disabled?: boolean;
        ontoggle?: () => void;
        children: Snippet;
        class?: string;
    }

    let { checked = false, disabled = false, ontoggle, children, class: extra_class, ...rest }: Props = $props();
</script>

<Row class={extra_class} {...rest}>
    <Handle />
    <label style="display:flex;align-items:center;gap:0.5em;flex:1;min-width:0;cursor:pointer;">
        <input type="checkbox" {checked} {disabled} onchange={ontoggle} />
        {@render children()}
    </label>
</Row>
