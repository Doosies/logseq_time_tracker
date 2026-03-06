<script lang="ts">
    import { Root, Prefix, Toggle } from '../../primitives/ToggleInput';
    import TextInput from '../../primitives/TextInput/TextInput.svelte';
</script>

<Root>
    <Prefix>URL</Prefix>
    <TextInput aria-label="입력" />
    <Toggle />
</Root>
