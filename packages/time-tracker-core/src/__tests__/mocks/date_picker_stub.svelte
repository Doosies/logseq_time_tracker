<script lang="ts">
    let {
        value,
        onSelect,
    }: {
        value: string | null;
        onSelect: (date: string) => void;
    } = $props();
</script>

<div data-testid="mock-date-picker">
    <span data-testid="mock-dp-value">{value ?? ''}</span>
    <button type="button" data-testid="mock-dp-select" onclick={() => onSelect('2025-06-15')}>날짜 선택</button>
</div>
