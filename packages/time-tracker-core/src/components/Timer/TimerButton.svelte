<script lang="ts">
    import { STRINGS } from '../../constants/strings';
    import * as css from './timer.css';

    let {
        active_job_exists,
        is_running,
        is_paused,
        job_selected,
        can_switch,
        onstart,
        onpause,
        onresume,
        onstop,
        oncancel,
        onswitch,
    }: {
        active_job_exists: boolean;
        is_running: boolean;
        is_paused: boolean;
        job_selected: boolean;
        can_switch: boolean;
        onstart: () => void;
        onpause: () => void;
        onresume: () => void;
        onstop: () => void;
        oncancel: () => void;
        onswitch: () => void;
    } = $props();

    let loading = $state(false);
</script>

<div class={css.timer_buttons}>
    {#if !active_job_exists}
        <button type="button" class={css.button_start} disabled={!job_selected || loading} onclick={onstart}>
            {STRINGS.timer.start}
        </button>
    {:else if is_paused}
        {#if can_switch}
            <button type="button" class={css.button_switch} disabled={loading} onclick={onswitch}>
                {STRINGS.timer.switch_job}
            </button>
        {/if}
        <button type="button" class={css.button_resume} disabled={loading} onclick={onresume}>
            {STRINGS.timer.resume}
        </button>
        <button type="button" class={css.button_stop} disabled={loading} onclick={onstop}>
            {STRINGS.timer.stop}
        </button>
        <button type="button" class={css.button_cancel} disabled={loading} onclick={oncancel}> 취소 </button>
    {:else if is_running}
        {#if can_switch}
            <button type="button" class={css.button_switch} disabled={loading} onclick={onswitch}>
                {STRINGS.timer.switch_job}
            </button>
        {/if}
        <button type="button" class={css.button_pause} disabled={loading} onclick={onpause}>
            {STRINGS.timer.pause}
        </button>
        <button type="button" class={css.button_stop} disabled={loading} onclick={onstop}>
            {STRINGS.timer.stop}
        </button>
        <button type="button" class={css.button_cancel} disabled={loading} onclick={oncancel}> 취소 </button>
    {/if}
</div>
