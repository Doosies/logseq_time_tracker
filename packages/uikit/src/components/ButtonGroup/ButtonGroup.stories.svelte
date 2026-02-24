<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, within } from '@storybook/test';
    import ButtonGroup from './ButtonGroup.svelte';
    import Button from '../Button/Button.svelte';

    const { Story } = defineMeta({
        component: ButtonGroup,
        title: 'uikit/ButtonGroup',
    });
</script>

<Story
    name="Default"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');
        await expect(buttons).toHaveLength(2);
    }}
>
    <Button variant="primary">첫 번째</Button>
    <Button variant="primary">두 번째</Button>
</Story>

<Story
    name="MixedVariants"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');
        await expect(buttons).toHaveLength(3);
        await expect(canvas.getByText('Primary')).toBeInTheDocument();
        await expect(canvas.getByText('Secondary')).toBeInTheDocument();
        await expect(canvas.getByText('Accent')).toBeInTheDocument();
    }}
>
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="accent">Accent</Button>
</Story>

<Story
    name="WithDisabled"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const buttons = canvas.getAllByRole('button');
        await expect(buttons[0]).not.toBeDisabled();
        await expect(buttons[1]).toBeDisabled();
    }}
>
    <Button variant="primary">활성</Button>
    <Button variant="primary" disabled>비활성</Button>
</Story>
