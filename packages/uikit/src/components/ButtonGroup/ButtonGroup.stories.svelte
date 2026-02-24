<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import ButtonGroup from './ButtonGroup.svelte';
    import Button from '../Button/Button.svelte';

    const { Story } = defineMeta({
        component: ButtonGroup,
        title: 'uikit/ButtonGroup',
    });
</script>

<Story name="Default">
    <Button variant="primary">첫 번째</Button>
    <Button variant="primary">두 번째</Button>
</Story>

<Story name="MixedVariants">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="accent">Accent</Button>
</Story>

<Story name="WithDisabled">
    <Button variant="primary">활성</Button>
    <Button variant="primary" disabled>비활성</Button>
</Story>
