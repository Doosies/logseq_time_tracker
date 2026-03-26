<script lang="ts">
    import { getContext } from 'svelte';
    import type { ToastLevel } from '../../../design/types';

    interface ToastContext {
        show: (message: string, level?: ToastLevel) => void;
    }

    const ctx = getContext<ToastContext>('toast');

    function show_at_level(level: ToastLevel) {
        ctx.show(`${level} 메시지`, level);
    }
</script>

<button type="button" aria-label="토스트 info 표시" onclick={() => show_at_level('info')}> info </button>
<button type="button" aria-label="토스트 success 표시" onclick={() => show_at_level('success')}> success </button>
<button type="button" aria-label="토스트 warning 표시" onclick={() => show_at_level('warning')}> warning </button>
<button type="button" aria-label="토스트 error 표시" onclick={() => show_at_level('error')}> error </button>
