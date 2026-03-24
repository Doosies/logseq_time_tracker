<script lang="ts">
    import type { ToastStore } from '../../stores/toast_store.svelte';
    import ToastItem from './ToastItem.svelte';
    import * as css from './toast.css';

    let {
        toast_store,
    }: {
        toast_store: ToastStore;
    } = $props();
</script>

<div class={css.toast_container} aria-live="polite">
    {#each toast_store.toasts as toast (toast.id)}
        <ToastItem {toast} ondismiss={(id) => toast_store.dismissToast(id)} />
    {/each}
</div>
