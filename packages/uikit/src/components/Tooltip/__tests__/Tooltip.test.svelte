<script lang="ts">
    import type { TooltipPosition } from '../../../design/types';
    import Tooltip from '../Tooltip.svelte';

    interface Props {
        content?: string;
        position?: TooltipPosition;
        disabled?: boolean;
        delay?: number;
    }

    let { content = '툴팁 내용', position = 'top', disabled = false, delay = 0 }: Props = $props();
</script>

<Tooltip {content} {position} {disabled} {delay}>
    <button type="button">호버 대상</button>
</Tooltip>
