<script lang="ts">
    import { ButtonGroup, Button } from '@personal/uikit';

    interface ActionBarProps {
        onApply: () => void;
        onClose: () => void;
    }

    let { onApply, onClose }: ActionBarProps = $props();
</script>

<ButtonGroup>
    <Button variant="primary" onclick={onApply} fullWidth>
        Apply
    </Button>
    <Button variant="secondary" onclick={onClose} fullWidth>
        Close
    </Button>
</ButtonGroup>
