<script lang="ts">
    import { SvelteDate } from 'svelte/reactivity';
    import type { DatePickerClasses } from './types';

    interface Props {
        value: string | null;
        onSelect: (date: string) => void;
        min?: string | undefined;
        max?: string | undefined;
        locale?: string | undefined;
        classes?: DatePickerClasses | undefined;
    }

    let { value, onSelect, min, max, locale = 'ko-KR', classes: class_map = {} }: Props = $props();

    /** Monday-first weekday short labels for the given locale (UTC-safe). */
    function getWeekdayLabels(loc: string): string[] {
        const formatter = new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'UTC' });
        const labels: string[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(Date.UTC(2025, 0, 6 + i));
            labels.push(formatter.format(d));
        }
        return labels;
    }

    const weekday_labels = $derived(getWeekdayLabels(locale));

    const grid_id = `dp-grid-${Math.random().toString(36).slice(2, 11)}`;

    let container_ref: HTMLDivElement | undefined = $state(undefined);
    let trigger_ref: HTMLButtonElement | undefined = $state(undefined);
    let grid_ref: HTMLDivElement | undefined = $state(undefined);

    let is_open = $state(false);
    let viewing_year = $state(new SvelteDate().getFullYear());
    let viewing_month = $state(new SvelteDate().getMonth() + 1);
    let active_cell_index = $state(0);

    function formatYmd(d: SvelteDate | Date): string {
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    function parseYmd(s: string | null): { y: number; m: number; d: number } | null {
        if (s === null || s === undefined || s === '') {
            return null;
        }
        const match = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) {
            return null;
        }
        return {
            y: Number(match[1]),
            m: Number(match[2]),
            d: Number(match[3]),
        };
    }

    function isDateDisabled(date_str: string): boolean {
        if (min !== undefined && date_str < min) {
            return true;
        }
        if (max !== undefined && date_str > max) {
            return true;
        }
        return false;
    }

    type CalendarCell = {
        date_str: string;
        in_current_month: boolean;
        disabled: boolean;
    };

    const calendar_cells = $derived.by(() => {
        const year = viewing_year;
        const month = viewing_month;
        const first = new SvelteDate(year, month - 1, 1);
        const monday_offset = (first.getDay() + 6) % 7;
        const grid_start = new SvelteDate(year, month - 1, 1 - monday_offset);
        const cells: CalendarCell[] = [];
        for (let i = 0; i < 42; i++) {
            const d = new SvelteDate(grid_start.getFullYear(), grid_start.getMonth(), grid_start.getDate() + i);
            const date_str = formatYmd(d);
            const in_current_month = d.getMonth() === month - 1;
            const disabled = isDateDisabled(date_str);
            cells.push({ date_str, in_current_month, disabled });
        }
        return cells;
    });

    const month_label_text = $derived(
        new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long' }).format(
            new SvelteDate(viewing_year, viewing_month - 1, 1),
        ),
    );

    const today_str = $derived(formatYmd(new SvelteDate()));

    function resolveActiveCellIndex(cells: CalendarCell[], val: string | null): number {
        const first_enabled = cells.findIndex((c) => !c.disabled);
        const fallback = first_enabled === -1 ? 0 : first_enabled;
        if (val === null || val === '') {
            return fallback;
        }
        const idx = cells.findIndex((c) => c.date_str === val);
        if (idx === -1) {
            return fallback;
        }
        return idx;
    }

    $effect(() => {
        if (!is_open) {
            return;
        }
        const parsed = parseYmd(value);
        if (parsed) {
            viewing_year = parsed.y;
            viewing_month = parsed.m;
        }
    });

    $effect(() => {
        if (!is_open) {
            return;
        }
        active_cell_index = resolveActiveCellIndex(calendar_cells, value);
    });

    $effect(() => {
        if (!is_open) {
            return;
        }
        const handler = (e: MouseEvent) => {
            if (container_ref && !container_ref.contains(e.target as Node)) {
                is_open = false;
            }
        };
        document.addEventListener('click', handler, true);
        return () => document.removeEventListener('click', handler, true);
    });

    const active_cell_dom_id = $derived(`${grid_id}-cell-${active_cell_index}`);

    const trigger_label = $derived(value !== null && value !== '' ? value : '날짜 선택');

    function stepMonth(delta: number) {
        let m = viewing_month + delta;
        let y = viewing_year;
        while (m < 1) {
            m += 12;
            y -= 1;
        }
        while (m > 12) {
            m -= 12;
            y += 1;
        }
        viewing_year = y;
        viewing_month = m;
    }

    function move_active(delta: number) {
        let next = active_cell_index + delta;
        const step = delta > 0 ? 1 : -1;
        while (next >= 0 && next < calendar_cells.length) {
            const cell = calendar_cells[next];
            if (cell && !cell.disabled) {
                active_cell_index = next;
                return;
            }
            next += step;
        }
    }

    function handleGridKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.preventDefault();
            is_open = false;
            trigger_ref?.focus();
            return;
        }
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            move_active(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            move_active(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            move_active(-7);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            move_active(7);
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const cell = calendar_cells[active_cell_index];
            if (cell && !cell.disabled) {
                onSelect(cell.date_str);
                is_open = false;
                trigger_ref?.focus();
            }
        }
    }

    function handleTriggerKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape' && is_open) {
            e.preventDefault();
            is_open = false;
            return;
        }
        if (!is_open && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            is_open = true;
            queueMicrotask(() => grid_ref?.focus());
        }
    }

    function toggleOpen() {
        is_open = !is_open;
        if (is_open) {
            queueMicrotask(() => grid_ref?.focus());
        }
    }

    function handleDayClick(cell: CalendarCell, e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (cell.disabled) {
            return;
        }
        onSelect(cell.date_str);
        is_open = false;
        trigger_ref?.focus();
    }

    function getDayCellClass(cell: CalendarCell): string {
        const c = class_map;
        const parts: string[] = [];
        if (c.day_cell) parts.push(c.day_cell);
        if (!cell.in_current_month && c.day_outside_month) {
            parts.push(c.day_outside_month);
        }
        if (cell.disabled && c.day_disabled) {
            parts.push(c.day_disabled);
        }
        if (value === cell.date_str && c.day_selected) {
            parts.push(c.day_selected);
        }
        if (today_str === cell.date_str && c.day_today) {
            parts.push(c.day_today);
        }
        return parts.join(' ');
    }
</script>

<div class={class_map.root} bind:this={container_ref}>
    <button
        type="button"
        class={class_map.trigger}
        bind:this={trigger_ref}
        aria-expanded={is_open}
        aria-haspopup="dialog"
        onclick={(e) => {
            e.stopPropagation();
            toggleOpen();
        }}
        onkeydown={handleTriggerKeydown}
    >
        <span>{trigger_label}</span>
        <span aria-hidden="true">{is_open ? '▴' : '▾'}</span>
    </button>

    {#if is_open}
        <div class={class_map.panel} role="dialog" aria-label="달력">
            <div class={class_map.header}>
                <button
                    type="button"
                    class={class_map.nav_button}
                    onclick={(e) => {
                        e.stopPropagation();
                        stepMonth(-1);
                    }}
                >
                    이전
                </button>
                <span class={class_map.month_label}>{month_label_text}</span>
                <button
                    type="button"
                    class={class_map.nav_button}
                    onclick={(e) => {
                        e.stopPropagation();
                        stepMonth(1);
                    }}
                >
                    다음
                </button>
            </div>
            <div class={class_map.weekdays} aria-hidden="true">
                {#each weekday_labels as label, weekday_index (weekday_index)}
                    <span>{label}</span>
                {/each}
            </div>
            <div
                bind:this={grid_ref}
                id={grid_id}
                class={class_map.grid}
                role="grid"
                tabindex="0"
                aria-activedescendant={active_cell_dom_id}
                onkeydown={handleGridKeydown}
            >
                {#each calendar_cells as cell, index (`${cell.date_str}-${index}`)}
                    <button
                        type="button"
                        id="{grid_id}-cell-{index}"
                        class={getDayCellClass(cell)}
                        disabled={cell.disabled}
                        aria-selected={value === cell.date_str}
                        aria-disabled={cell.disabled}
                        role="gridcell"
                        tabindex="-1"
                        onclick={(e) => handleDayClick(cell, e)}
                        onmouseenter={() => {
                            if (!cell.disabled) {
                                active_cell_index = index;
                            }
                        }}
                    >
                        {Number(cell.date_str.slice(8, 10))}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
