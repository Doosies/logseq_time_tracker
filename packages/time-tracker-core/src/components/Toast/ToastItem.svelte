<script lang="ts">
    import type { Toast, ToastLevel } from '../../stores/toast_store.svelte';
    import * as css from './toast.css';

    let {
        toast,
        ondismiss,
    }: {
        toast: Toast;
        ondismiss: (id: string) => void;
    } = $props();

    const level_class: Record<ToastLevel, string> = {
        success: css.toast_success,
        error: css.toast_error,
        warning: css.toast_warning,
        info: css.toast_info,
    };
</script>

<div class="{css.toast_item} {level_class[toast.level]}" role="alert">
    <span class={css.toast_message}>{toast.message}</span>
    <button type="button" class={css.toast_close} onclick={() => ondismiss(toast.id)} aria-label="닫기"> × </button>
</div>
