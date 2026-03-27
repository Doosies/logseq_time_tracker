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
    import { setContext } from 'svelte';
    import { clickOutside } from '../../actions';
    import type { Snippet } from 'svelte';

    interface PopoverContext {
        get is_open(): boolean;
        toggle: () => void;
        close: () => void;
    }

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
    let is_open = $state(false);

    function toggle(): void {
        is_open = !is_open;
    }

    function close(): void {
        is_open = false;
    }

    const ctx: PopoverContext = {
        get is_open() {
            return is_open;
        },
        toggle,
        close,
    };

    setContext('popover', ctx);
</script>

<div class={extra_class} style="position: relative;" use:clickOutside={close}>
    {@render children()}
</div>
