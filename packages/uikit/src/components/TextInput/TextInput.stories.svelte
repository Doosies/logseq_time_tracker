<script module>
    import { defineMeta } from '@storybook/addon-svelte-csf';
    import { expect, fn, within, userEvent } from '@storybook/test';
    import TextInput from './TextInput.svelte';

    const { Story } = defineMeta({
        component: TextInput,
        title: 'uikit/TextInput',
        args: {
            oninput: fn(),
        },
        argTypes: {
            disabled: { control: 'boolean' },
            placeholder: { control: 'text' },
        },
    });
</script>

<Story
    name="Default"
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');
        await expect(input).toBeInTheDocument();
        await expect(input).not.toBeDisabled();
    }}
/>

<Story
    name="WithPlaceholder"
    args={{ placeholder: '입력하세요...' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByPlaceholderText('입력하세요...')).toBeInTheDocument();
    }}
/>

<Story
    name="WithInitialValue"
    args={{ value: '초기값' }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toHaveValue('초기값');
    }}
/>

<Story
    name="Disabled"
    args={{ disabled: true }}
    play={async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeDisabled();
    }}
/>

<Story
    name="WithInputHandler"
    play={async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');
        await userEvent.type(input, 'hello');
        await expect(args.oninput).toHaveBeenCalled();
    }}
/>
