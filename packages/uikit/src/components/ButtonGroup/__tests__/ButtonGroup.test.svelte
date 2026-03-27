<script lang="ts">
    import ButtonGroup from '../ButtonGroup.svelte';
    import Button from '../../Button/Button.svelte';

    interface Props {
        aria_label?: string;
    }

    let { aria_label = '관련 버튼 모음' }: Props = $props();
</script>

<ButtonGroup aria-label={aria_label}>
    <Button variant="primary">첫 번째</Button>
    <Button variant="secondary">두 번째</Button>
</ButtonGroup>
