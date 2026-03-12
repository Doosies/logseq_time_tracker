<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { TooltipPosition } from '../../design/types';
    import { Tooltip as PrimitiveTooltip } from '../../primitives/Tooltip';
    import * as styles from '../../design/styles/tooltip.css';

    interface Props {
        content: string;
        position?: TooltipPosition;
        disabled?: boolean;
        delay?: number;
        children: Snippet;
    }

    let { content, position = 'top', disabled = false, delay = 0, children }: Props = $props();
</script>

<PrimitiveTooltip
    {content}
    {position}
    {disabled}
    {delay}
    container_class={styles.tooltip_container}
    content_class={styles.tooltip_content}
>
    {@render children()}
</PrimitiveTooltip>
