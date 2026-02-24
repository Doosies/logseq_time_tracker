<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, fn, within, userEvent } from '@storybook/test';
    import ToggleInput from './ToggleInput.svelte';

    const { Story } = defineMeta({
        component: ToggleInput,
        title: 'uikit/ToggleInput',
        args: {
            onToggle: fn(),
            onchange: fn(),
        },
        argTypes: {
            isTextMode: { control: 'boolean' },
            prefix: { control: 'text' },
        },
    });

    const options = [
        { value: 'a', label: 'Option A' },
        { value: 'b', label: 'Option B' },
    ];
</script>

<Story
    name="SelectMode"
    args={{ options, isTextMode: false }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox')).toBeInTheDocument();
        const toggle_btn = canvas.getByRole('button', { name: 'Toggle input mode' });
        await expect(toggle_btn).toBeInTheDocument();
        await expect(toggle_btn).toHaveTextContent('✏️');
    }}
/>

<Story
    name="TextMode"
    args={{ options, isTextMode: true }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeInTheDocument();
        const toggle_btn = canvas.getByRole('button', { name: 'Toggle input mode' });
        await expect(toggle_btn).toHaveTextContent('🔽');
    }}
/>

<Story
    name="WithPrefix"
    args={{ options, prefix: 'Server:' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Server:')).toBeInTheDocument();
    }}
/>

<Story
    name="ToggleClick"
    args={{ options }}
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const toggle_btn = canvas.getByRole('button', { name: 'Toggle input mode' });
        await userEvent.click(toggle_btn);
        await expect(args.onToggle).toHaveBeenCalledOnce();
    }}
/>

<Story
    name="SelectChange"
    args={{ options, isTextMode: false }}
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const select = canvas.getByRole('combobox');
        await userEvent.selectOptions(select, 'b');
        await expect(args.onchange).toHaveBeenCalledWith('b');
    }}
/>

<Story
    name="TextInput"
    args={{ options, isTextMode: true }}
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');
        await userEvent.type(input, 'hello');
        await expect(args.onchange).toHaveBeenCalled();
    }}
/>

<Story
    name="EmptyPrefix"
    args={{ options, prefix: '' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByText('Server:')).not.toBeInTheDocument();
    }}
/>
