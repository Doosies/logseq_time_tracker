<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Card } from '@personal/uikit';

    interface PopupLayoutProps {
        children: Snippet;
    }

    let { children }: PopupLayoutProps = $props();
</script>

<Card>
    {@render children()}
</Card>
