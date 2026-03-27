<!--
@component Tooltip - 스타일이 적용된 툴팁 래퍼. 호버/포커스 시 content를 표시.
  Props: content (본문 문자열), position (기본 top), disabled, delay(ms), children (트리거).
-->
<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { TooltipPosition } from '../../design/types';
    import * as styles from '../../design/styles/tooltip.css';

    const GAP = 8;
    const HIDE_DELAY_MS = 50;

    function flipOrder(preferred: TooltipPosition): TooltipPosition[] {
        const order: Record<TooltipPosition, TooltipPosition[]> = {
            top: ['bottom', 'left', 'right'],
            bottom: ['top', 'left', 'right'],
            left: ['right', 'top', 'bottom'],
            right: ['left', 'top', 'bottom'],
        };
        return order[preferred] ?? ['top', 'bottom', 'left', 'right'];
    }

    function calculateCoords(
        trigger_rect: DOMRect,
        tooltip_size: { width: number; height: number },
        position: TooltipPosition,
        gap: number,
    ): { top: number; left: number } {
        const trigger_center_x = trigger_rect.left + trigger_rect.width / 2;
        const trigger_center_y = trigger_rect.top + trigger_rect.height / 2;
        const tooltip_half_w = tooltip_size.width / 2;
        const tooltip_half_h = tooltip_size.height / 2;

        switch (position) {
            case 'top':
                return {
                    top: trigger_rect.top - tooltip_size.height - gap,
                    left: trigger_center_x - tooltip_half_w,
                };
            case 'bottom':
                return {
                    top: trigger_rect.bottom + gap,
                    left: trigger_center_x - tooltip_half_w,
                };
            case 'left':
                return {
                    top: trigger_center_y - tooltip_half_h,
                    left: trigger_rect.left - tooltip_size.width - gap,
                };
            case 'right':
                return {
                    top: trigger_center_y - tooltip_half_h,
                    left: trigger_rect.right + gap,
                };
            default:
                return {
                    top: trigger_rect.top - tooltip_size.height - gap,
                    left: trigger_center_x - tooltip_half_w,
                };
        }
    }

    function isInViewport(
        top: number,
        left: number,
        size: { width: number; height: number },
        viewport: { width: number; height: number },
    ): boolean {
        const padding = 8;
        return (
            top >= padding &&
            left >= padding &&
            top + size.height <= viewport.height - padding &&
            left + size.width <= viewport.width - padding
        );
    }

    function computePosition(
        trigger_rect: DOMRect,
        tooltip_size: { width: number; height: number },
        preferred: TooltipPosition,
    ): { top: number; left: number; position: TooltipPosition } {
        const viewport = { width: window.innerWidth, height: window.innerHeight };
        const positions: TooltipPosition[] = [preferred, ...flipOrder(preferred)];

        for (const pos of positions) {
            const { top, left } = calculateCoords(trigger_rect, tooltip_size, pos, GAP);
            if (isInViewport(top, left, tooltip_size, viewport)) {
                return { top, left, position: pos };
            }
        }
        const { top, left } = calculateCoords(trigger_rect, tooltip_size, preferred, GAP);
        return { top, left, position: preferred };
    }

    interface Props {
        content: string;
        position?: TooltipPosition;
        disabled?: boolean;
        delay?: number;
        children: Snippet;
        id?: string;
    }

    let { content, position = 'top', disabled = false, delay = 0, children, id }: Props = $props();

    let is_visible = $state(false);
    let wrapper_el = $state<HTMLDivElement | null>(null);
    let portal_target: HTMLDivElement | null = null;

    let show_timeout_id: ReturnType<typeof setTimeout> | null = null;
    let hide_timeout_id: ReturnType<typeof setTimeout> | null = null;

    const tooltip_id = $derived(id ?? `tooltip-${Math.random().toString(36).slice(2, 11)}`);

    function clearShowTimeout(): void {
        if (show_timeout_id !== null) {
            clearTimeout(show_timeout_id);
            show_timeout_id = null;
        }
    }

    function clearHideTimeout(): void {
        if (hide_timeout_id !== null) {
            clearTimeout(hide_timeout_id);
            hide_timeout_id = null;
        }
    }

    function updatePosition(): void {
        if (!wrapper_el || !portal_target) return;
        const trigger_rect = wrapper_el.getBoundingClientRect();
        const tooltip_rect = portal_target.getBoundingClientRect();
        const result = computePosition(
            trigger_rect,
            { width: tooltip_rect.width, height: tooltip_rect.height },
            position,
        );
        const content_el = portal_target.firstElementChild as HTMLElement;
        if (content_el) {
            content_el.setAttribute('data-position', result.position);
        }
        portal_target.style.top = `${result.top}px`;
        portal_target.style.left = `${result.left}px`;
    }

    function handleTriggerEnter(): void {
        if (disabled) return;
        clearHideTimeout();
        if (delay > 0) {
            show_timeout_id = setTimeout(() => {
                show_timeout_id = null;
                is_visible = true;
            }, delay);
        } else {
            is_visible = true;
        }
    }

    function handleTriggerLeave(): void {
        clearShowTimeout();
        hide_timeout_id = setTimeout(() => {
            hide_timeout_id = null;
            is_visible = false;
        }, HIDE_DELAY_MS);
    }

    function handleTooltipEnter(): void {
        clearHideTimeout();
    }

    function handleTooltipLeave(): void {
        hide_timeout_id = setTimeout(() => {
            hide_timeout_id = null;
            is_visible = false;
        }, HIDE_DELAY_MS);
    }

    $effect(() => {
        if (!is_visible) {
            if (portal_target?.parentNode) {
                portal_target.remove();
            }
            portal_target = null;
            return;
        }

        portal_target = document.createElement('div');
        portal_target.className = styles.tooltip_container;
        portal_target.setAttribute('role', 'tooltip');
        portal_target.id = tooltip_id;
        portal_target.addEventListener('mouseenter', handleTooltipEnter);
        portal_target.addEventListener('mouseleave', handleTooltipLeave);

        portal_target.style.pointerEvents = 'auto';

        const content_el = document.createElement('div');
        content_el.className = styles.tooltip_content;
        content_el.textContent = content;
        portal_target.appendChild(content_el);

        document.body.appendChild(portal_target);

        requestAnimationFrame(() => {
            updatePosition();
        });

        return () => {
            portal_target?.removeEventListener('mouseenter', handleTooltipEnter);
            portal_target?.removeEventListener('mouseleave', handleTooltipLeave);
            portal_target?.remove();
            portal_target = null;
        };
    });
</script>

<div
    class="tooltip-wrapper"
    role="group"
    bind:this={wrapper_el}
    onmouseenter={handleTriggerEnter}
    onmouseleave={handleTriggerLeave}
    aria-describedby={is_visible ? tooltip_id : undefined}
>
    {@render children()}
</div>
