<script lang="ts">
    import { getContext } from 'svelte';

    interface ToastContext {
        show: (message: string) => void;
    }

    const ctx = getContext<ToastContext>('toast');
</script>

<button
    type="button"
    onclick={() => ctx.show('에러 메시지입니다.')}
    aria-label="토스트 표시"
>
    토스트 표시
</button>
