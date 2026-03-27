<script lang="ts">
    import { Root, Prefix, Toggle } from '../../components/ToggleInput';
    import TextInput from '../../components/TextInput/TextInput.svelte';
</script>

<Root>
    <Prefix>URL</Prefix>
    <TextInput aria-label="입력" />
    <Toggle />
</Root>
