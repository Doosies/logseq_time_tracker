<!--
@component Toast.Provider - Toast context provider

Wraps children to provide `show(message)` and `hide(id?)` via context.

@prop duration - Auto-dismiss duration in ms (default: 2500)

@example
```svelte
<Toast.Provider duration={3000}>
    <YourApp />
    <Toast.Root />
</Toast.Provider>
```
-->
<script lang="ts">
    import { Provider as PrimitiveProvider } from '../../primitives/Toast';
    import type { Snippet } from 'svelte';

    interface Props {
        duration?: number;
        children: Snippet;
    }

    let { duration, children }: Props = $props();
</script>

<PrimitiveProvider {...duration != null ? { duration } : {}}>
    {@render children()}
</PrimitiveProvider>
