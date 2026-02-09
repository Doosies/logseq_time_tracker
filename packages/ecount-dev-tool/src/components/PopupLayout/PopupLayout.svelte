<script lang="ts">
    import { Card } from '@personal/uikit';

    interface PopupLayoutProps {
        children: any;
    }

    let { children }: PopupLayoutProps = $props();
</script>

<Card>
    {@render children()}
</Card>
