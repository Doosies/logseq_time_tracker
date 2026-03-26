<!--
@component Tooltip - 스타일이 적용된 툴팁 래퍼. 호버/포커스 시 content를 표시.
  Props: content (본문 문자열), position (기본 top), disabled, delay(ms), children (트리거).
-->
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
