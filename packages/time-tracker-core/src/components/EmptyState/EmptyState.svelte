<script lang="ts">
    import { STRINGS } from '../../constants/strings';
    import * as css from './empty_state.css';

    let {
        oncreate,
    }: {
        oncreate: () => void;
    } = $props();
</script>

<div class={css.empty_container}>
    <div class={css.empty_icon}>📋</div>
    <p class={css.empty_text}>아직 작업이 없습니다</p>
    <button type="button" class={css.empty_button} onclick={oncreate}>
        {STRINGS.job.create}
    </button>
</div>
