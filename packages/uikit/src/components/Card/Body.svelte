<script lang="ts">
    import { Body as PrimitiveBody } from '../../primitives/Card';
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
        class?: string;
    }

    let { children, class: extra_class }: Props = $props();
</script>

<PrimitiveBody class={extra_class ?? ''}>
    {@render children()}
</PrimitiveBody>
