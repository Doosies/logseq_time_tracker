<!--
@component Popover.Root - Popover container

Manages open/close state via context. Closes on outside click or Escape key.

@example
```svelte
<Popover.Root>
    <Popover.Trigger>Open</Popover.Trigger>
    <Popover.Content label="Menu">Content</Popover.Content>
</Popover.Root>
```
-->
<script lang="ts">
    import { Root as PrimitiveRoot } from '../../primitives/Popover';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<PrimitiveRoot {...extra_class != null ? { class: extra_class } : {}}>
    {@render children()}
</PrimitiveRoot>
