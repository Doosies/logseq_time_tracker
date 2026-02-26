<script lang="ts">
    import { Provider as PrimitiveProvider } from '../../primitives/Toast';
    import type { Snippet } from 'svelte';

    interface Props {
        duration?: number;
        children: Snippet;
    }

    let { duration, children }: Props = $props();
</script>

<PrimitiveProvider {...(duration != null ? { duration } : {})}>
    {@render children()}
</PrimitiveProvider>
