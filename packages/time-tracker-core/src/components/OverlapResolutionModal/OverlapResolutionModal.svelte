<script lang="ts">
    import * as css from './overlap_resolution_modal.css';
    import type { TimeEntry } from '../../types/time_entry';

    let {
        new_entry,
        overlapping,
        onResolve,
        onCancel,
    }: {
        new_entry: { started_at: string; ended_at: string; job_id: string };
        overlapping: TimeEntry[];
        onResolve: (strategy: 'new_first' | 'existing_first') => void;
        onCancel: () => void;
    } = $props();

    let modal_ref: HTMLDivElement | undefined = $state(undefined);
    let resolve_new_ref: HTMLButtonElement | undefined = $state(undefined);

    type SegmentLayout = { left: number; width: number; key: string };

    function intervalOverlap(
        a_start: string,
        a_end: string,
        b_start: string,
        b_end: string,
    ): { start: string; end: string } | null {
        const start = a_start > b_start ? a_start : b_start;
        const end = a_end < b_end ? a_end : b_end;
        if (start < end) {
            return { start, end };
        }
        return null;
    }

    const timeline = $derived.by(() => {
        const times = [
            Date.parse(new_entry.started_at),
            Date.parse(new_entry.ended_at),
            ...overlapping.flatMap((e) => [Date.parse(e.started_at), Date.parse(e.ended_at)]),
        ];
        const min_t = Math.min(...times);
        const max_t = Math.max(...times);
        const span = Math.max(max_t - min_t, 1);
        const toSeg = (start_iso: string, end_iso: string, key: string): SegmentLayout => {
            const s = Date.parse(start_iso);
            const e = Date.parse(end_iso);
            const left = ((s - min_t) / span) * 100;
            const width = Math.max(((e - s) / span) * 100, 0.35);
            return { left, width, key };
        };
        const existing_layouts = overlapping.map((e) => toSeg(e.started_at, e.ended_at, e.id));
        const new_layout = toSeg(new_entry.started_at, new_entry.ended_at, 'new');
        const overlap_layouts: SegmentLayout[] = [];
        for (const e of overlapping) {
            const o = intervalOverlap(new_entry.started_at, new_entry.ended_at, e.started_at, e.ended_at);
            if (o) {
                overlap_layouts.push(toSeg(o.start, o.end, `ov-${e.id}`));
            }
        }
        return { existing_layouts, new_layout, overlap_layouts };
    });

    const overlap_summary = $derived.by(() => {
        const fmt = new Intl.DateTimeFormat('ko-KR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        const new_range = `${fmt.format(new Date(new_entry.started_at))} — ${fmt.format(new Date(new_entry.ended_at))}`;
        return {
            new_range,
            count: overlapping.length,
        };
    });

    $effect(() => {
        queueMicrotask(() => resolve_new_ref?.focus());
    });

    function getFocusableElements(): HTMLElement[] {
        if (!modal_ref) {
            return [];
        }
        return Array.from(
            modal_ref.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), select:not([disabled])',
            ),
        );
    }

    function handleOverlayKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
            return;
        }
        if (e.key !== 'Tab' || !modal_ref) {
            return;
        }
        const focusables = getFocusableElements();
        if (focusables.length === 0) {
            return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!modal_ref.contains(active)) {
            e.preventDefault();
            first?.focus();
            return;
        }
        if (e.shiftKey) {
            if (active === first) {
                e.preventDefault();
                last?.focus();
            }
        } else if (active === last) {
            e.preventDefault();
            first?.focus();
        }
    }
</script>

<div class={css.overlay} role="presentation" tabindex="-1" onkeydown={handleOverlayKeydown}>
    <div bind:this={modal_ref} class={css.modal} role="dialog" aria-modal="true" aria-labelledby="overlap-modal-title">
        <h2 id="overlap-modal-title" class={css.modal_title}>시간 겹침</h2>
        <p class={css.modal_description}>
            입력한 구간이 기존 수동 기록 {overlap_summary.count}건과 겹칩니다.<br />
            <strong>새 구간:</strong>
            {overlap_summary.new_range}
        </p>

        <div class={css.timeline_wrap}>
            <div class={css.timeline_label} id="overlap-timeline-label">타임라인</div>
            <div
                class={css.timeline_track}
                role="img"
                aria-labelledby="overlap-timeline-label"
                aria-label="새 입력은 파란색, 기존 기록은 회색, 겹치는 구간은 빨간색으로 표시됩니다"
            >
                {#each timeline.existing_layouts as seg (seg.key)}
                    <div class={css.segment_existing} style:left={`${seg.left}%`} style:width={`${seg.width}%`}></div>
                {/each}
                <div
                    class={css.segment_new}
                    style:left={`${timeline.new_layout.left}%`}
                    style:width={`${timeline.new_layout.width}%`}
                ></div>
                {#each timeline.overlap_layouts as seg (seg.key)}
                    <div class={css.segment_overlap} style:left={`${seg.left}%`} style:width={`${seg.width}%`}></div>
                {/each}
            </div>
            <div class={css.legend}>
                <span class={css.legend_item}>
                    <span class={css.legend_swatch} style:background-color="#3b82f6"></span>
                    새 입력
                </span>
                <span class={css.legend_item}>
                    <span class={css.legend_swatch} style:background-color="#9ca3af"></span>
                    기존 기록
                </span>
                <span class={css.legend_item}>
                    <span class={css.legend_swatch} style:background-color="#ef4444"></span>
                    겹침
                </span>
            </div>
        </div>

        <div class={css.button_row}>
            <button type="button" class={css.button_cancel} onclick={onCancel}>취소</button>
            <button type="button" class={css.button_secondary} onclick={() => onResolve('existing_first')}>
                기존 입력 우선
            </button>
            <button
                bind:this={resolve_new_ref}
                type="button"
                class={css.button_primary}
                onclick={() => onResolve('new_first')}
            >
                현재 입력 우선
            </button>
        </div>
    </div>
</div>
