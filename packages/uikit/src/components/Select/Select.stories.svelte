<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, fn, within, userEvent } from '@storybook/test';
    import Select from './Select.svelte';

    const { Story } = defineMeta({
        component: Select,
        title: 'uikit/Select',
        args: {
            onchange: fn(),
        },
        argTypes: {
            disabled: { control: 'boolean' },
        },
    });

    const default_options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
        { value: 'c', label: 'Option C' },
    ];

    const many_options = Array.from({ length: 10 }, (_, i) => ({
        value: 'opt' + i,
        label: 'Option ' + (i + 1),
    }));
</script>

<Story
    name="Default"
    args={{ options: default_options }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeInTheDocument();
        await expect(canvas.getByText('Option A')).toBeInTheDocument();
        await expect(canvas.getByText('Option B')).toBeInTheDocument();
        await expect(canvas.getByText('Option C')).toBeInTheDocument();
    }}
/>

<Story
    name="WithInitialValue"
    args={{ options: default_options, value: 'b' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toHaveValue('b');
    }}
/>

<Story
    name="Disabled"
    args={{ options: default_options, disabled: true }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeDisabled();
    }}
/>

<Story name="ManyOptions" args={{ options: many_options }} />

<Story
    name="WithChangeHandler"
    args={{ options: default_options }}
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByRole('combobox');
        await userEvent.selectOptions(select, 'b');
        await expect(args.onchange).toHaveBeenCalledWith('b');
    }}
/>

<Story
    name="EmptyOptions"
    args={{ options: [] }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByRole('combobox');
        await expect(select).toBeInTheDocument();
        await expect(select.querySelectorAll('option')).toHaveLength(0);
    }}
/>
