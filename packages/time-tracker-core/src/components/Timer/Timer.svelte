<script lang="ts">
    import TimerDisplay from './TimerDisplay.svelte';
    import TimerButton from './TimerButton.svelte';
    import * as css from './timer.css';
    import type { TimerStore } from '../../stores/timer_store.svelte';
    import type { JobStore } from '../../stores/job_store.svelte';

    let {
        timer_store,
        job_store,
        onstart,
        onpause,
        onresume,
        onstop,
        oncancel,
    }: {
        timer_store: TimerStore;
        job_store: JobStore;
        onstart: () => void;
        onpause: () => void;
        onresume: () => void;
        onstop: () => void;
        oncancel: () => void;
    } = $props();
</script>

<section class={css.timer_container} aria-label="타이머">
    {#if timer_store.state.active_job}
        <div class={css.timer_info}>
            {timer_store.state.active_job.title}
            {#if timer_store.state.active_category}
                — {timer_store.state.active_category.name}
            {/if}
        </div>
    {/if}
    <TimerDisplay
        accumulated_ms={timer_store.state.accumulated_ms}
        current_segment_start={timer_store.state.current_segment_start}
        is_paused={timer_store.state.is_paused}
    />
    <TimerButton
        active_job_exists={timer_store.state.active_job !== null}
        is_running={timer_store.is_running}
        is_paused={timer_store.state.is_paused}
        job_selected={job_store.selected_job !== null}
        {onstart}
        {onpause}
        {onresume}
        {onstop}
        {oncancel}
    />
</section>
