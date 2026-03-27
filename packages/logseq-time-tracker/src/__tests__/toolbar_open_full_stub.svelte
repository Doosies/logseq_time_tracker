<script lang="ts">
    let {
        on_open_full_view = () => {},
    }: {
        context?: unknown;
        on_open_full_view?: () => void;
        inline?: boolean;
        on_reason_modal_change?: unknown;
    } = $props();
</script>

<button type="button" class="toolbar-open-fullview-stub" onclick={() => on_open_full_view()}>전체 화면 열기</button>
