<script lang="ts">
    import TimerDisplay from './TimerDisplay.svelte';
    import TimerButton from './TimerButton.svelte';
    import * as css from './timer.css';
    import type { TimerStore } from '../../stores/timer_store.svelte';
    import type { JobStore } from '../../stores/job_store.svelte';

    let {
        timer_store,
        job_store,
        selected_job_total_seconds = 0,
        onstart,
        onpause,
        onresume,
        onstop,
        oncancel,
        onswitch,
    }: {
        timer_store: TimerStore;
        job_store: JobStore;
        selected_job_total_seconds?: number;
        onstart: () => void;
        onpause: () => void;
        onresume: () => void;
        onstop: () => void;
        oncancel: () => void;
        onswitch: () => void;
    } = $props();

    const is_viewing_active = $derived(
        timer_store.state.active_job !== null && timer_store.active_job_id === job_store.selected_job_id,
    );

    const can_switch = $derived(
        timer_store.state.active_job !== null &&
            job_store.selected_job !== null &&
            timer_store.active_job_id !== job_store.selected_job_id,
    );
</script>

<section class={css.timer_container} aria-label="타이머">
    {#if is_viewing_active && timer_store.state.active_job}
        <div class={css.timer_info}>
            {timer_store.state.active_job.title}
            {#if timer_store.state.active_category}
                — {timer_store.state.active_category.name}
            {/if}
        </div>
    {:else if job_store.selected_job}
        <div class={css.timer_info}>
            {job_store.selected_job.title} (누적)
        </div>
    {/if}
    {#if is_viewing_active}
        <TimerDisplay
            accumulated_ms={timer_store.state.accumulated_ms}
            current_segment_start={timer_store.state.current_segment_start}
            is_paused={timer_store.state.is_paused}
        />
    {:else}
        <TimerDisplay
            accumulated_ms={selected_job_total_seconds * 1000}
            current_segment_start={null}
            is_paused={true}
        />
    {/if}
    <TimerButton
        active_job_exists={timer_store.state.active_job !== null}
        is_running={timer_store.is_running}
        is_paused={timer_store.state.is_paused}
        job_selected={job_store.selected_job !== null}
        {can_switch}
        {onstart}
        {onpause}
        {onresume}
        {onstop}
        {oncancel}
        {onswitch}
    />
</section>
