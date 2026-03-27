<script lang="ts">
    import Select from '../../components/Select/Select.svelte';
</script>

<Select
    aria-label="옵션 선택"
    options={[
        { value: 'a', label: '옵션 A' },
        { value: 'b', label: '옵션 B' },
    ]}
/>
