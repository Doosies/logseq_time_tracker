<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, fn, within, userEvent } from '@storybook/test';
    import Button from './Button.svelte';

    const { Story } = defineMeta({
        component: Button,
        title: 'uikit/Button',
        args: {
            onclick: fn(),
        },
        argTypes: {
            variant: {
                control: 'select',
                options: ['primary', 'secondary', 'accent'],
            },
            size: {
                control: 'radio',
                options: ['sm', 'md'],
            },
            disabled: { control: 'boolean' },
            fullWidth: { control: 'boolean' },
        },
    });
</script>

<Story
    name="Primary"
    args={{ variant: 'primary' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button')).toBeInTheDocument();
        await expect(canvas.getByText('Click me')).toBeInTheDocument();
    }}
>
    Click me
</Story>

<Story name="Secondary" args={{ variant: 'secondary' }}>Secondary</Story>

<Story name="Accent" args={{ variant: 'accent' }}>Accent</Story>

<Story name="Small" args={{ size: 'sm', variant: 'primary' }}>Small</Story>

<Story name="Medium" args={{ size: 'md', variant: 'primary' }}>Medium</Story>

<Story
    name="Disabled"
    args={{ disabled: true, variant: 'primary' }}
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await expect(button).toBeDisabled();
        await userEvent.click(button);
        await expect(args.onclick).not.toHaveBeenCalled();
    }}
>
    Disabled
</Story>

<Story
    name="FullWidth"
    args={{ fullWidth: true, variant: 'primary' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button')).toBeInTheDocument();
    }}
>
    Full Width
</Story>

<Story
    name="WithClickHandler"
    args={{ variant: 'primary' }}
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole('button');
        await userEvent.click(button);
        await expect(args.onclick).toHaveBeenCalledOnce();
    }}
>
    Click to test
</Story>

<Story name="AllVariants" asChild>
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="accent">Accent</Button>
    </div>
</Story>

<Story name="AllSizes" asChild>
    <div style="display: flex; gap: 8px; align-items: center;">
        <Button size="sm" variant="primary">Small</Button>
        <Button size="md" variant="primary">Medium</Button>
    </div>
</Story>
