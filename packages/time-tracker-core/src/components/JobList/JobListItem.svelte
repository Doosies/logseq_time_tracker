<script lang="ts">
    import type { Job } from '../../types';
    import { STRINGS } from '../../constants/strings';
    import { formatDuration } from '../../utils/time';
    import * as css from './job_list.css';

    let {
        job,
        is_selected,
        total_seconds = 0,
        is_active_running = false,
        running_since = null as string | null,
        accumulated_ms = 0,
        onclick,
    }: {
        job: Job;
        is_selected: boolean;
        total_seconds?: number;
        is_active_running?: boolean;
        running_since?: string | null;
        accumulated_ms?: number;
        onclick: () => void;
    } = $props();

    const status_label = $derived(STRINGS.job.status[job.status]);

    let display_seconds = $state(0);

    $effect.pre(() => {
        if (!is_active_running || !running_since) {
            display_seconds = total_seconds + Math.floor(accumulated_ms / 1000);
        }
    });

    $effect(() => {
        if (!is_active_running || !running_since) {
            return;
        }

        let raf_id = 0;
        const segment_start = running_since;

        function tick() {
            const segment_ms = Date.now() - new Date(segment_start).getTime();
            display_seconds = total_seconds + Math.floor((accumulated_ms + segment_ms) / 1000);
            raf_id = requestAnimationFrame(tick);
        }

        tick();

        return () => {
            if (raf_id !== 0) {
                cancelAnimationFrame(raf_id);
            }
        };
    });

    const duration_label = $derived(display_seconds > 0 ? formatDuration(display_seconds) : '');
</script>

<button
    type="button"
    class="{css.job_item}{is_selected ? ` ${css.job_item_selected}` : ''}"
    aria-current={is_selected ? 'true' : undefined}
    {onclick}
>
    <span class={css.job_title}>{job.title}</span>
    {#if duration_label}
        <span class={css.job_duration}>{duration_label}</span>
    {/if}
    <span class={css.status_badge}>{status_label}</span>
</button>
