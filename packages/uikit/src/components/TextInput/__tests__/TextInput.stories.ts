import type { Meta, StoryObj } from '@storybook/svelte-vite';
import { expect, fn, within, userEvent } from 'storybook/test';
import TextInput from '../TextInput.svelte';

const meta = {
    component: TextInput,
    title: 'uikit/TextInput',
    args: {
        oninput: fn(),
    },
    argTypes: {
        disabled: { control: 'boolean' },
        placeholder: { control: 'text' },
    },
} satisfies Meta<typeof TextInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');
        await expect(input).toBeInTheDocument();
        await expect(input).not.toBeDisabled();
    },
};

export const WithPlaceholder: Story = {
    args: { placeholder: '입력하세요...' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByPlaceholderText('입력하세요...')).toBeInTheDocument();
    },
};

export const WithInitialValue: Story = {
    args: { value: '초기값' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toHaveValue('초기값');
    },
};

export const Disabled: Story = {
    args: { disabled: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox')).toBeDisabled();
    },
};

export const WithInputHandler: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox');
        await userEvent.type(input, 'hello');
        await expect(args['oninput']).toHaveBeenCalled();
    },
};
