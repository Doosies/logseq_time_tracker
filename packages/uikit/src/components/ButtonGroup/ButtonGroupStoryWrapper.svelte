<script lang="ts">
    import ButtonGroup from './ButtonGroup.svelte';
    import Button from '../Button/Button.svelte';

    interface Props {
        scenario?: 'default' | 'mixed' | 'withDisabled';
    }

    let { scenario = 'default' }: Props = $props();
</script>

<ButtonGroup>
    {#if scenario === 'default'}
        <Button variant="primary">첫 번째</Button>
        <Button variant="primary">두 번째</Button>
    {:else if scenario === 'mixed'}
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
    {:else if scenario === 'withDisabled'}
        <Button variant="primary">활성</Button>
        <Button variant="primary" disabled>비활성</Button>
    {/if}
</ButtonGroup>
